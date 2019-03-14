const express = require("express");
const app = express();

const index = require("./routes/index");
const books = require("./routes/books");

app.use(express.static("public"));
app.use(express.json());

app.use("/books", books);
app
  .route("/books")
  .get((req, res) => {
    res;
  })
  .post((req, res) => {
    res;
  });

app.use("/", index);

module.exports = app;
