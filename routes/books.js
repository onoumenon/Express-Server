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
  .get((req, res, next) => {
    const book = books.find(function(book) {
      return book.isbn === req.params.isbn;
    });
    res.status(200).json(book);
  })
  .delete(verifyToken, (req, res) => {
    const book = books.find(function(book) {
      return book.isbn === req.params.isbn;
    });
    res.status(202).end(`Deleted Book of isbn: ${book.isbn}`);
  })
  .patch(verifyToken, (req, res) => {
    let book = books.find(function(book) {
      return book.isbn === req.params.isbn;
    });
    Object.assign(book, req.body);
    res
      .status(202)
      .end(
        `Patched Book of isbn: ${book.isbn}, Book is now: ${book.author}, ${
          book.title
        }, QNTY: ${book.quantity}`
      );
  })
  .put(verifyToken, (req, res) => {
    let book = books.find(function(book) {
      return book.isbn === req.params.isbn;
    });
    book = req.body;
    res
      .status(202)
      .end(
        `Put Book of isbn: ${book.isbn}, Book is now: ${book.author}, ${
          book.title
        }, QNTY: ${book.quantity}`
      );
  });

router
  .route("/")
  .get((req, res, next) => {
    let filteredBooks = books;
    for (const key in req.query) {
      filteredBooks = filteredBooks.filter(book =>
        book[key].toLowerCase().includes(req.query[key].toLowerCase())
      );
    }
    res.json(filteredBooks);
  })
  .post(verifyToken, (req, res) => {
    const book = req.body;
    res.status(201).json(book);
  });

module.exports = router;
