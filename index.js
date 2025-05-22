import express from "express";
import pg from "pg";

const app = express();
const PORT = 3000;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book_notes",
    password: "ComputerScience!12",
    port: 5432,
});

db.connect();

app.get('/', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM Books");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Database error");
    }
    // res.render("home.ejs");
});

app.listen(PORT, () => {
    console.log(`Server is running on \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
});