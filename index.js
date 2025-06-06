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
    res.render("home/home.ejs", { result: items, search: null, rating: null });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Database error");
  }
});

app.get("/search", async (req, res) => {
  const { search, rating } = req.query;
  if ((search == null || search === "") && (rating == null || rating === "")) {
    return res.redirect("/");
  }
  try {
    var result;
    if (search == null || search === "") {
      result = await db.query(
        "SELECT b.id, b.title, b.author, b.read_date, r.rating, r.notes_summary, l.book_link, l.image_link " +
          "FROM books b LEFT JOIN ratings r ON r.book_id = b.id LEFT JOIN links l ON l.book_id = b.id " +
          "WHERE r.rating = $1;",
        [rating]
      );
    } else if (rating == null || rating === "") {
      result = await db.query(
        "SELECT b.id, b.title, b.author, b.read_date, r.rating, r.notes_summary, l.book_link, l.image_link " +
          "FROM books b LEFT JOIN ratings r ON r.book_id = b.id LEFT JOIN links l ON l.book_id = b.id " +
          "WHERE b.title ILIKE $1 OR b.author ILIKE $1 OR l.isbn ILIKE $1;",
        [`%${search}%`]
      );
    } else {
      result = await db.query(
        "SELECT b.id, b.title, b.author, b.read_date, r.rating, r.notes_summary, l.book_link, l.image_link " +
          "FROM books b LEFT JOIN ratings r ON r.book_id = b.id LEFT JOIN links l ON l.book_id = b.id " +
          "WHERE (b.title ILIKE $1 OR b.author ILIKE $1 OR l.isbn ILIKE $1) AND r.rating = $2;",
        [`%${search}%`, rating]
      );
    }
    let items = [];
    items = result.rows;
    res.render("home/home.ejs", { result: items, search, rating });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Database error");
  }
});

app.get("/faq", (req, res) => {
  res.render("faq.ejs");
});

app.get("/book/:id", async (req, res) => {
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

app.get("/add_book", (req, res) => {
  res.render("addEditBook.ejs", {
    id: null,
    title: null,
    author: null,
    isbn: null,
    read_date: null,
    book_link: null,
    rating: null,
    notes_summary: null,
    notes: null,
    addOrEdit: "add",
    adminPasswordNotCorrect: false,
    imageNotFound: false,
  });
});

app.get("/edit_book/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }
  try {
    const result = await db.query(
      "SELECT b.title, b.author, b.read_date, r.rating, r.notes_summary, r.notes, l.book_link, l.isbn " +
        "FROM books b LEFT JOIN ratings r ON r.book_id = b.id LEFT JOIN links l ON l.book_id = b.id " +
        "WHERE b.id = $1;",
      [bookId]
    );
    if (result.rows.length > 0) {
      res.render("addEditBook.ejs", {
        id: bookId,
        title: result.rows[0].title,
        author: result.rows[0].author,
        isbn: result.rows[0].isbn,
        read_date: result.rows[0].read_date,
        book_link: result.rows[0].book_link,
        rating: result.rows[0].rating,
        notes_summary: result.rows[0].notes_summary,
        notes: result.rows[0].notes,
        addOrEdit: "edit",
        adminPasswordNotCorrect: false,
        imageNotFound: false,
      });
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).send("Database error");
  }
});

app.get("/delete_book/:id", (req, res) => {
  res.render("deleteBook.ejs", {
    bookId: req.params.id,
    adminPasswordNotCorrect: false,
  });
});

app.post("/add_book", async (req, res) => {
  const {
    title,
    author,
    isbn,
    read_date,
    book_link,
    rating,
    notes_summary,
    notes,
    admin_password,
    image_link,
  } = req.body;

  if (admin_password !== "abcd") {
    return res.render("addEditBook.ejs", {
      id: null,
      title,
      author,
      isbn,
      read_date,
      book_link,
      rating,
      notes_summary,
      notes,
      admin_password,
      image_link,
      addOrEdit: "add",
      adminPasswordNotCorrect: true,
      imageNotFound: false,
    });
  }

  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;

  let response;

  try {
    response = await fetch(url, { method: "GET" });
  } catch (error) {
    console.error("Error fetching image link:", error);
  }

  if (response.status !== 404 || image_link) {
    try {
      const result = await db.query(
        "INSERT INTO books (title, author, read_date) VALUES ($1, $2, $3) RETURNING id",
        [title, author, read_date]
      );
      const bookId = result.rows[0].id;

      await db.query(
        "INSERT INTO ratings (book_id, rating, notes_summary, notes) VALUES ($1, $2, $3, $4)",
        [bookId, rating, notes_summary, notes]
      );

      await db.query(
        "INSERT INTO links (book_id, book_link, image_link) VALUES ($1, $2, $3)",
        [bookId, book_link, url || image_link]
      );

      res.redirect("/");
    } catch (error) {
      console.error("Error adding book:", error);
      res.status(500).send("Database error");
    }
  } else {
    console.error("Error fetching image link: Cover not found (404)");

    return res.render("addEditBook.ejs", {
      id: null,
      title,
      author,
      isbn,
      read_date,
      book_link,
      rating,
      notes_summary,
      notes,
      admin_password,
      image_link,
      addOrEdit: "add",
      adminPasswordNotCorrect: false,
      imageNotFound: true,
    });
  }
});

app.post("/edit_book", async (req, res) => {
  const {
    id,
    title,
    author,
    isbn,
    read_date,
    book_link,
    rating,
    notes_summary,
    notes,
    admin_password,
    image_link,
  } = req.body;

  if (admin_password !== "abcd") {
    return res.render("addEditBook.ejs", {
      id,
      title,
      author,
      isbn,
      read_date,
      book_link,
      rating,
      notes_summary,
      notes,
      admin_password,
      image_link,
      addOrEdit: "edit",
      adminPasswordNotCorrect: true,
      imageNotFound: false,
    });
  }

  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;

  let response;

  try {
    response = await fetch(url, { method: "GET" });
  } catch (error) {
    console.error("Error fetching image link:", error);
  }

  if (response.status !== 404 || image_link) {
    try {
      const result = await db.query(
        "UPDATE books SET title = $1, author = $2, read_date = $3 WHERE id = $4",
        [title, author, read_date, id]
      );

      await db.query(
        "UPDATE ratings SET rating = $1, notes_summary = $2, notes = $3 WHERE book_id = $4",
        [rating, notes_summary, notes, id]
      );

      await db.query(
        "UPDATE links SET book_link = $1, image_link = $2, isbn = $3 WHERE book_id = $4",
        [book_link, url || image_link, isbn, id]
      );

      res.redirect("/");
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).send("Database error");
    }
  } else {
    console.error("Error fetching image link: Cover not found (404)");

    return res.render("addEditBook.ejs", {
      id,
      title,
      author,
      isbn,
      read_date,
      book_link,
      rating,
      notes_summary,
      notes,
      addOrEdit: "edit",
      adminPasswordNotCorrect: false,
      imageNotFound: true,
    });
  }
});

app.post("/delete_book/:id", async (req, res) => {
  const bookId = req.params.id;
  const adminPassword = req.body.admin_password;

  if (adminPassword !== "abcd") {
    return res.render("deleteBook.ejs", {
      bookId: bookId,
      adminPasswordNotCorrect: true,
    });
  }

  try {
    await db.query("DELETE FROM links WHERE book_id = $1", [bookId]);
    await db.query("DELETE FROM ratings WHERE book_id = $1", [bookId]);
    await db.query("DELETE FROM books WHERE id = $1", [bookId]);

    res.redirect("/");
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).send("Database error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
});
