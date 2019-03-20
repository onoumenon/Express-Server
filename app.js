const express = require("express");
const cors = require("cors");
const app = express();

const index = require("./routes/index");
const books = require("./routes/books");

app.use(express.static("public"));
app.use(express.json());

app.use("/api/v1/books", books);

app.use("/", index);

module.exports = app;
