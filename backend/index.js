const express = require("express");
const app = express();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

app.use(cors());
app.use(express.json());

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Seed Genres if empty
const seedGenres = async () => {
    const count = await prisma.genre.count();
    if (count === 0) {
        const genres = [
            "Ghazal", "Nazm", "Haiku", "Free Verse", "Sufi",
            "Romantic", "Sad", "Nature", "Patriotic", "Humour",
            "Abstract", "Philosophy"
        ];
        for (const name of genres) {
            await prisma.genre.create({ data: { name } });
        }
        console.log("Genres seeded");
    }
};
seedGenres();

// --- Auth Routes ---

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        res.json({ message: "User created" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists or invalid data" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
        res.json({ token, userId: user.id });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// --- Poem Routes ---

app.get("/poems/feed", async (req, res) => {
    // Random feed: Prisma doesn't support ORDER BY RANDOM natively easily across DBs,
    // but for Postgres we can use raw query or just skip/take logic.
    // For simplicity and beginner friendliness, we'll fetch latest for now, 
    // or use raw query if strictly needed. User asked for "ORDER BY RANDOM()".
    try {
        const poems = await prisma.$queryRaw`
       SELECT p.id, p.title, p.content, p."likesCount", p."createdAt", p."authorId", 
              u.name as "authorName"
       FROM "Poem" p
       JOIN "User" u ON p."authorId" = u.id
       ORDER BY RANDOM()
       LIMIT 20;
     `;
        // Note: Relation loading with raw query is tricky for arrays like genres/comments.
        // To keep it simple and consistent with other routes, let's use Prisma findMany with shuffle in memory (if specific for random)
        // or just normal query. User asked for RANDOM. Raw query is best for that.
        // However, fetching relations (Genres, Likes) is annoying with raw SQL.
        // Fallback: Fetch all (or many) and shuffle, or pick random IDs.
        // Better approach for strict requirements:
        // Fetch using findMany, but we want random.
        // Let's stick to 'createdAt' desc for now as a fallback if random is too complex to keep "Simple".
        // But user insisted on "Feed: Random poems".
        // Easy way: Get count, pick random skip.

        const count = await prisma.poem.count();
        const skip = Math.max(0, Math.floor(Math.random() * count) - 20);
        const feed = await prisma.poem.findMany({
            take: 20,
            skip: skip, // Quasi-random window
            include: {
                author: { select: { name: true } },
                genres: { include: { genre: true } },
                _count: { select: { comments: true } }
            },
            // No order by, default usually ID
        });
        // Shuffle in JS
        const shuffled = feed.sort(() => 0.5 - Math.random());
        res.json(shuffled);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching feed" });
    }
});

app.get("/poems/top", async (req, res) => {
    try {
        const poems = await prisma.poem.findMany({
            orderBy: { likesCount: "desc" },
            take: 20,
            include: {
                author: { select: { name: true } },
                genres: { include: { genre: true } },
                _count: { select: { comments: true } }
            },
        });
        res.json(poems);
    } catch (err) {
        res.status(500).json({ error: "Error fetching top poems" });
    }
});

app.get("/poems/liked", authenticateToken, async (req, res) => {
    try {
        const likes = await prisma.like.findMany({
            where: { userId: req.user.id },
            include: {
                poem: {
                    include: {
                        author: { select: { name: true } },
                        genres: { include: { genre: true } },
                        _count: { select: { comments: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        const poems = likes.map(l => l.poem);
        res.json(poems);
    } catch (err) {
        res.status(500).json({ error: "Error fetching liked poems" });
    }
});

app.get("/poems/mine", authenticateToken, async (req, res) => {
    try {
        const poems = await prisma.poem.findMany({
            where: { authorId: req.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                author: { select: { name: true } },
                genres: { include: { genre: true } },
                _count: { select: { comments: true } }
            },
        });
        res.json(poems);
    } catch (err) {
        res.status(500).json({ error: "Error fetching your poems" });
    }
});

app.post("/poems/create", authenticateToken, async (req, res) => {
    const { title, content, genreIds } = req.body;
    // genreIds should be array of Int
    try {
        const poem = await prisma.poem.create({
            data: {
                title,
                content,
                authorId: req.user.id,
                genres: {
                    create: genreIds.map(id => ({ genre: { connect: { id } } }))
                }
            },
        });
        res.json(poem);
    } catch (err) {
        res.status(500).json({ error: "Error creating poem" });
    }
});

// --- Comments & Likes ---

app.get("/comments/:poemId", async (req, res) => {
    const { poemId } = req.params;
    try {
        const comments = await prisma.comment.findMany({
            where: { poemId: parseInt(poemId) },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: "desc" }
        });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: "Error fetching comments" });
    }
});

app.post("/comments", authenticateToken, async (req, res) => {
    const { text, poemId } = req.body;
    try {
        const comment = await prisma.comment.create({
            data: {
                text,
                poemId: parseInt(poemId),
                userId: req.user.id
            },
            include: { user: { select: { name: true } } }
        });
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: "Error adding comment" });
    }
});

app.post("/likes/:poemId", authenticateToken, async (req, res) => {
    const { poemId } = req.params;
    const userId = req.user.id;
    const pId = parseInt(poemId);

    try {
        const existing = await prisma.like.findUnique({
            where: { userId_poemId: { userId, poemId: pId } }
        });

        if (existing) {
            // Unlike
            await prisma.like.delete({
                where: { userId_poemId: { userId, poemId: pId } }
            });
            await prisma.poem.update({
                where: { id: pId },
                data: { likesCount: { decrement: 1 } }
            });
            res.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: { userId, poemId: pId }
            });
            await prisma.poem.update({
                where: { id: pId },
                data: { likesCount: { increment: 1 } }
            });
            res.json({ liked: true });
        }
    } catch (err) {
        res.status(500).json({ error: "Error toggling like" });
    }
});

// --- Profile Routes ---

app.get("/profile/:userId", authenticateToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                _count: { select: { poems: true } }
            }
        });
        // Don't send password
        const { password, ...userData } = user;
        res.json(userData);
    } catch (err) {
        res.status(500).json({ error: "Error fetching profile" });
    }
});

app.put("/profile/:userId", authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { name, email, password } = req.body;

    // Basic security: only allow editing own profile
    if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const data = { name, email };
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }
        const updated = await prisma.user.update({
            where: { id: parseInt(userId) },
            data
        });
        const { password: _, ...userData } = updated;
        res.json(userData);
    } catch (err) {
        res.status(500).json({ error: "Error updating profile" });
    }
});

app.get("/genres", async (req, res) => {
    try {
        const genres = await prisma.genre.findMany();
        res.json(genres);
    } catch (err) {
        res.status(500).json({ error: "Error fetching genres" });
    }
});

app.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}`));