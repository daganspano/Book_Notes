CREATE TABLE links(
	id SERIAL PRIMARY KEY,
	book_id INT NOT NULL UNIQUE,
	book_link TEXT UNIQUE,
	isbn VARCHAR(31) UNIQUE,
	image_link TEXT UNIQUE,
	CONSTRAINT fk_book FOREIGN KEY (book_id) REFERENCES books(id)
);