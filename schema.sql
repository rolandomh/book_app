DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  description TEXT
);

INSERT INTO books (author, title, isbn, image_url, description) 
VALUES('refactor this text','efactor this text', 'efactor this text','efactor this text','efactor this text');


-- when done run in terminal : psql -d book_app -f schema.sql