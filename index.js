import express from "express";
import bodyParser from "body-parser";
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', async (req, res) => {
    try {
        const result = await db.query("SELECT b.id, b.title, b.author, b.read_date, r.rating, r.notes, r.notes_summary, l.book_link, l.image_link " + 
            "FROM books b LEFT JOIN ratings r ON r.book_id = b.id LEFT JOIN links l ON l.book_id = b.id;");
        let items = [];
        items = result.rows;
        res.render("home.ejs", {result: items});
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Database error");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
});