'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();
require('ejs');
// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
//new part
const methodOverride = require('method-override');
// Application Setup
const PORT = process.env.PORT || 3000;
// Start express
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
//set default view engine
app.set('view engine', 'ejs');
//server pages to client
app.use(express.static('./public'));
// //Decode post data
app.use(express.urlencoded({extended : true}));
// deep water routes
app.use(methodOverride('_method'));
//routes ...continued
app.get('/', homePage);
app.get('/searches/new', searchPage);
app.post('/searches', callAPI);
app.get('/books/:id', viewDetails);
app.post('/books', addBook);
// app.get('/books', listBook);
app.put('/edit/:id', updateDetails);
app.delete('/books/:id', deleteBook);

//ERROR CALLBACK
app.use('*', error404);

//  homePage func
function homePage(req, res){
  const databaseReq = `SELECT * FROM books`;
  let counter = 0;
  client.query(databaseReq)
    .then(data => {
      if(data.rows){
        const outputArray = data.rows.map(book => {
          counter++;
          return book;
        });
        res.status(200).render('pages/index', {
          results: outputArray,
          counter: counter
        });
      }else{res.status(200).render('pages/index');}
    })
    .catch(error => error500(req, res, error));
}
// searchFunc
function searchPage(req, res){
  res.status(200).render('pages/searches/new');
}
// Google Books API Func/super
function callAPI(req, res){
  const search = req.body.search;
  const selection = req.body.select;
  const maxResults = 10;
  let URL = `https://www.googleapis.com/books/v1/volumes?q=`;
  if(selection === 'title'){URL += `+intitle:${search}`;}
  if(selection === 'author'){URL += `+inauthor:${search}`;}
  superagent.get(URL)
    .query(maxResults)
    .then(data => {
      const outputArray = data.body.items.map(book => {
        return new MakeBook(book.volumeInfo);
      });
      res.status(200).render('pages/searches/show', {results: outputArray});
    })
    .catch(error => error500(req, res, error));
}
// ViewDeets Func
function viewDetails(req, res){
  const SQL = 'SELECT * FROM books WHERE id=$1';
  const parameters = [req.params.id];
  client.query(SQL, parameters)
    .then(data => {
      res.status(200).render('pages/books/show', {book: data.rows[0]});
    })
    .catch(error => error500(req, res, error));
}
// addBook Func
function addBook(req, res){
  const book = req.body;
  const checkData = 'SELECT * FROM books WHERE isbn=$1';
  const checkParam = [req.body.isbn];
  const saveData = 'INSERT INTO books (author, title, isbn, image_url, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
  const saveParam = [book.author, book.title, book.isbn, book.image_url, book.description, book.bookshelf];
  client.query(checkData, checkParam)
    .then(data => {
      if(data.rows.length === 0){
        client.query(saveData, saveParam)
          .then(() => console.log('data saved'));
      }
      res.status(200).render('pages/books/show', {book: book});
    })
    .catch(error => error500(req, res, error));
}
// Update Func
function updateDetails(req, res){
  console.log(req.params);
  const book = req.body;
  const SQL = `UPDATE books
      SET author = $1,
          title = $2,
          isbn = $3,
          image_url = $4,
          description = $5,
          bookshelf = $6
      WHERE id=$7`;
  const parameters = [book.author, book.title, book.isbn, book.image_url, book.description, book.bookshelf, req.params.id];
  client.query(SQL, parameters)
    .then (() => {
      res.status(200).redirect('/');
    })
    .catch(error => error500(req, res, error));
}
// Delete Func
function deleteBook(req, res){
  // console.log(request.body);
  const SQL = `DELETE from books WHERE id=$1`;
  const parameters = [req.params.id];
  client.query(SQL, parameters)
    .then(() =>{
      res.status(200).redirect('/');
    })
    .catch(error => error500(req, res, error));
}
// makeBook Func
function MakeBook(book){
  this.title = book.title ? book.title : 'Title Unavailable';
  this.author = book.authors ? book.authors : 'Author Unknown';
  this.isbn = book.industryIdentifiers[0].identifier ? book.industryIdentifiers[0].identifier : 'no isbn info';
  this.image_url = book.imageLinks.thumbnail ? book.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = book.description ? book.description : 'unread';
  this.bookshelf = book.categories ? book.categories : 'uhm';
}
// Errors
function error404(req, res) {
  console.log('Error 404');
  res.status(404).render(`pages/error`);
}
function error500(req, res, error) {
  console.log('ERROR 500:', error);
  res.status(500).render(`pages/error`);
}
// TurnOn SERVER
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`It's Alive!`);
    });
  })
  .catch(error => {
    console.log('error message:', error);
  });
