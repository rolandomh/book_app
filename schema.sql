DROP TABLE IF EXISTS bookshelf;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(225),
  image_url VARCHAR(255),
  description VARCHAR(255),
  bookshelf VARCHAR(255)
  status VARCHAR(255),
  category VARCHAR(255)
  contact VARCHAR(255),
);

INSERT INTO tasks (id, author, title, isbn, image_url, contact, bookshelf, status, category, description) 
VALUES('refactor this text','efactor this text', 'efactor this text','efactor this text','efactor this text');


-- when done run in terminal : psql -d book_app -f schema.sql