SELECT b.title, b.author, b.read_date,
	r.rating, r.notes_summary, r.notes,
	l.book_link, l.image_link
FROM books b 
	LEFT JOIN ratings r ON r.book_id = b.id 
	LEFT JOIN links l ON l.book_id = b.id
WHERE b.id = 1;