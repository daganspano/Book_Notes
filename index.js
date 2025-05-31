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

app.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT b.id, b.title, b.author, b.read_date, r.rating, r.notes_summary, l.book_link, l.image_link " +
        "FROM books b LEFT JOIN ratings r ON r.book_id = b.id LEFT JOIN links l ON l.book_id = b.id;"
    );
    let items = [];
    items = result.rows;
    res.render("home.ejs", { result: items });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Database error");
  }
});

app.get("/book/:id", async (req, res) => {
  console.log(req.params.id);
  const bookId = parseInt(req.params.id, 10);
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }
  try {
    const result = await db.query(
      "SELECT b.title, b.author, b.read_date, r.rating, r.notes_summary, r.notes, l.book_link, l.image_link " +
        "FROM books b LEFT JOIN ratings r ON r.book_id = b.id LEFT JOIN links l ON l.book_id = b.id " +
        "WHERE b.id = $1;",
      [bookId]
    );
    if (result.rows.length > 0) {
      res.render("book.ejs", { book: result.rows[0] });
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).send("Database error");
  }
});

app.get("/faq", (req, res) => {
  res.render("faq.ejs");
});

app.listen(PORT, () => {
  console.log(`Server is running on \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
});
