const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const User = require("../models/User");
const Book = require("../models/Book");
const secret = process.env.SECRET;

// implement audience? howto in insomnia? , {audience: req.hostname}

const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new Error("Invalid Token");
    }
    const token = req.headers.authorization.split("Bearer ")[1];

    const userData = await jwt.verify(token, secret);
    const user = await User.findOne({ id: userData.id });

    if (!userData || !user) {
      throw new Error("Invalid Token");
    }
    next();
  } catch (err) {
    return res.status(403).send(err.message);
  }
};

router
  .route("/:id")
  .get((req, res) => {
    Book.findById(req.params.id, (err, book) => {
      if (!book) {
        return res.sendStatus(404);
      }
      if (err) {
        return res.sendStatus(500);
      }
      return res.sendStatus(200).json(book);
    });
  })
  .delete(verifyToken, (req, res) => {
    Book.findByIdAndDelete(req.params.id, (err, book) => {
      if (!book) {
        return res.sendStatus(404);
      }
      if (err) {
        return res.sendStatus(500);
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
        if (!book) {
          return res.sendStatus(404);
        }
        if (err) {
          return res.sendStatus(500);
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
