
	CREATE UNIQUE INDEX unique_notes_hash ON ratings (md5(notes));
	CREATE UNIQUE INDEX unique_notes_summary_hash ON ratings (md5(notes_summary));