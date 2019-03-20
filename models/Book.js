const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    quantity: {
      type: Number,
      default: 0
    },
    isbn: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: String,
    author: String,
    published: String,
    publisher: String,
    pages: Number,
    description: String,
    website: String
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
