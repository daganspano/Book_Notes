CREATE TABLE ratings(
	id SERIAL PRIMARY KEY,
	book_id INT NOT NULL UNIQUE,
	rating INT NOT NULL,
	notes TEXT NOT NULL,
	notes_summary TEXT NOT NULL,
	CONSTRAINT fk_book FOREIGN KEY (book_id) REFERENCES books(id)
);