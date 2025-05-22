SELECT b.id, b.title, b.author, b.read_date, r.rating,
	r.notes, r.notes_summary, l.book_link, l.image_link
FROM books b
	JOIN ratings r ON r.book_id = b.id
	JOIN links l ON l.book_id = b.id;