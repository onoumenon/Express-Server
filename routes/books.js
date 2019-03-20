const express = require("express");
const router = express.Router();

const Book = require("../models/Book");

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization !== "Bearer token-name-here") {
    res.sendStatus(403);
  } else if (authorization === "Bearer token-name-here") {
    next();
  }
};

router
  .route("/:id")
  .get((req, res) => {
    Book.findById(req.params.id, (err, book) => {
      if (err) {
        return res.sendStatus(500);
      }
      if (!book) {
        return res.sendStatus(404);
      }
      return res.sendStatus(200).json(book);
    });
  })
  .delete(verifyToken, (req, res) => {
    Book.findByIdAndDelete(req.params.id, (err, book) => {
      if (err) {
        return res.sendStatus(500);
      }
      if (!book) {
        return res.sendStatus(404);
      }
      return res.sendStatus(202);
    });
  })
  .put(verifyToken, (req, res) => {
    Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
      (err, book) => {
        if (err) {
          return res.sendStatus(500);
        }
        if (!book) {
          return res.sendStatus(404);
        }
        return res.status(202).json(book);
      }
    );
  });

router
  .route("/")
  .get((req, res) => {
    const { author, title } = req.query;
    const authorRegex = new RegExp(author, "i");
    const titleRegex = new RegExp(title, "i");
    if (title && author) {
      return Book.find({ title: titleRegex, author: authorRegex }).then(book =>
        res.json(book)
      );
    }
    if (title) {
      return Book.find({ title: titleRegex }).then(book => res.json(book));
    }

    if (author) {
      return Book.find({ author: authorRegex }).then(book => res.json(book));
    }

    return Book.find().then(book => res.json(book));
  })
  .post(verifyToken, (req, res) => {
    const book = new Book(req.body);
    book.save((err, book) => {
      if (err) {
        return res.status(500).end();
      }
      return res.status(201).json(book);
    });
  });

module.exports = router;
