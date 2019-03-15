const express = require("express");
const router = express.Router();

let books = require("../booksService");

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization !== "Bearer token-name-here") {
    res.sendStatus(403);
  } else if (authorization === "Bearer token-name-here") {
    next();
  }
};

const findBook = id => {
  return books.find(function(book) {
    return book.isbn === id;
  });
};

router
  .route("/:isbn")
  .get((req, res) => {
    const foundBook = findBook(req.params.isbn);
    if (!foundBook) {
      res.status(404).end("Book Not Found");
    }
    res.status(200).json(foundBook);
  })
  .delete(verifyToken, (req, res) => {
    const foundBook = findBook(req.params.isbn);
    if (!foundBook) {
      res.status(404).end("Cannot Delete Book, As Book Not Found");
    }
    books = books.filter(book => book.isbn !== req.params.isbn);
    res.status(202).end(`Deleted Book of isbn: ${req.params.isbn}`);
  })
  .patch(verifyToken, (req, res) => {
    const foundBook = findBook(req.params.isbn);
    if (!foundBook) {
      res.status(404).end("Cannot Patch Book, As Book Not Found");
    }
    Object.assign(foundBook, req.body);
    Object.assign(books, foundBook);
    res.status(202).json(foundBook);
  })
  .put(verifyToken, (req, res) => {
    const isbn = req.params.isbn;
    let foundBook = findBook(isbn);
    if (!foundBook) {
      res.status(404).end("Cannot Patch Book, As Book Not Found");
    }
    foundBook = { isbn, ...req.body };
    Object.assign(books, foundBook);
    res.status(202).json(foundBook);
  });

router
  .route("/")
  .get((req, res, next) => {
    let filteredBooks = books;
    let reqQuery = Object.keys(req.query);
    for (const key of reqQuery) {
      filteredBooks = filteredBooks.filter(book =>
        book[key].toLowerCase().includes(reqQuery[key].toLowerCase())
      );
    }
    if (filteredBooks.length < 1) {
      res.status(404).end("No Book Found");
    }
    res.json(filteredBooks);
  })
  .post(verifyToken, (req, res) => {
    const book = req.body;
    let existingBook = findBook(req.body.isbn);
    if (existingBook) {
      res.status(405).end("Book already exists, please use PUT/PATCH instead.");
    }
    books.push(book);
    res.status(201).json(book);
  });

module.exports = router;
