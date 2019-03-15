const express = require("express");
const router = express.Router();

const books = require("../booksService");

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization !== "Bearer token-name-here") {
    res.sendStatus(403);
  } else if (authorization === "Bearer token-name-here") {
    next();
  }
};

router
  .route("/:isbn")
  .get((req, res) => {
    const book = books.find(function(book) {
      return book.isbn === req.params.isbn;
    });
    res.status(200).json(book);
  })
  .delete(verifyToken, (req, res) => {
    res.status(202).end(`Deleted Book of isbn: ${req.params.isbn}`);
    // (TO DO) books = books.filter(book => book.isbn !== req.params.isbn);
  })
  //TO DO PATCH & PUT change books
  .patch(verifyToken, (req, res) => {
    let book = books.find(function(book) {
      return book.isbn === req.params.isbn;
    });

    Object.assign(book, req.body);
    res.status(202).json(book);
  })
  .put(verifyToken, (req, res) => {
    const isbn = req.params.isbn;
    let book = books.find(function(book) {
      return book.isbn === isbn;
    });

    book = { isbn, ...req.body };
    res.status(202).json(book);
  });

router
  .route("/")
  .get((req, res, next) => {
    let filteredBooks = books;
    let reqQuery = Object.keys(req.query);
    for (const key of reqQuery) {
      filteredBooks = filteredBooks.filter(book =>
        book[key].toLowerCase().includes(req.query[key].toLowerCase())
      );
    }
    res.json(filteredBooks);
  })
  .post(verifyToken, (req, res) => {
    const book = req.body;
    books.push(book);
    res.status(201).json(book);
  });

module.exports = router;
