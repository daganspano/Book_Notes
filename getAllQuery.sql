SELECT b.id, b.title, b.author, b.read_date, 
	r.rating, r.notes, r.notes_summary, 
	l.book_link, l.image_link
FROM books b
	LEFT JOIN ratings r ON r.book_id = b.id
	LEFT JOIN links l ON l.book_id = b.id;