const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Book = require("../models/Book");

const route = "api/v1//books";

describe("Books API", () => {
  let mongod;
  let db;

  beforeAll(async () => {
    jest.setTimeout(120000);
    mongod = new MongoMemoryServer();
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000
    });
    db = mongoose.connection;
  });

  beforeEach(async () => {
    await Book.insertMany([
      {
        isbn: "9781593275846",
        title: "Eloquent JavaScript, Second Edition",
        author: "Marijn Haverbeke"
      },
      {
        isbn: "9781449331818",
        title: "Learning JavaScript Design Patterns",
        author: "Addy Osmani"
      }
    ]);
  });

  afterEach(async () => {
    await db.dropCollection("books");
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("[GET] books", () => {
    test("Get all books", done => {
      const expectedBooks = [
        {
          isbn: "9781593275846",
          title: "Eloquent JavaScript, Second Edition",
          author: "Marijn Haverbeke"
        },
        {
          isbn: "9781449331818",
          title: "Learning JavaScript Design Patterns",
          author: "Addy Osmani"
        }
      ];
      request(app)
        .get(route)
        .expect(200)
        .expect("Content-Type", /json/)
        .then(res => {
          const books = res.body;

          expect(books.length).toBe(2);
          books.forEach((book, index) => {
            expect(book.title).toBe(expectedBooks[index].title);
            expect(book.author).toBe(expectedBooks[index].author);
          });
        });
      done();
    });

    test("return a book matching title query", done => {
      request(app)
        .get(route)
        .query({ title: "Learning JavaScript Design Patterns" })
        .expect("content-type", /json/)
        .expect(200)
        .then(res => {
          const book = res.body[0];
          expect(book.title).toBe("Learning JavaScript Design Patterns");
        });
      done();
    });

    test("return books matching author query", done => {
      request(app)
        .get(route)
        .query({ author: "Addy Osmani" })
        .expect("content-type", /json/)
        .expect(200)
        .then(res => {
          const book = res.body[0];
          expect(book.author).toBe("Addy Osmani");
          expect(book.title).toBe("Learning JavaScript Design Patterns");
        });
      done();
    });
  });

  describe("[POST] Create book", () => {
    test("denies access when no token given", done => {
      request(app)
        .post(route)
        .send({ title: "ABC", author: "DEF" })
        .expect(403),
        done();
    });

    test("denies access if token is invalid", done => {
      request(app)
        .post(route)
        .set("Authorization", "Bearer invalid-token")
        .send({ title: "ABC", author: "DEF" })
        .expect(403),
        done();
    });

    test("creates a new book in db", async () => {
      const res = await request(app)
        .post(route)
        .set("Authorization", "Bearer token-name-here")
        .send({ title: "ABC", author: "DEF" })
        .expect(201);

      expect(res.body.title).toBe("ABC");
      expect(res.body.author).toBe("DEF");

      const book = Book.findOne({ title: "ABC" });
      expect(book.title).toBe("ABC");
      expect(book.author).toBe("DEF");
    });
  });

  describe("[PUT] Edits an existing book", () => {
    test("edits a book's title and author", async () => {
      const { _id } = await Book.findOne({
        title: "Learning JavaScript Design Patterns"
      });

      const res = await request(app)
        .put(`${route}/${_id}`)
        .send({
          title: "Learning JavaScript Design Patterns",
          author: "Some Edit Here"
        })
        .expect(202);

      expect(res.body).toEqual(
        expect.objectContaining({
          title: "Learning JavaScript Design Patterns",
          author: "Some Edit Here"
        })
      );
    });

    test("returns 400 Bad Request as there is no such book", done => {
      const id = "100";
      return (
        request(app)
          .put(`${route}/${_id}`)
          .send({
            id: 100,
            title: "ABC",
            author: "DEF"
          })
          .expect(400),
        done()
      );
    });
  });

  describe("[DELETE] Removes an existing book", () => {
    test("removes a book from the database", async () => {
      const { _id } = await Book.findOne({
        title: "Learning JavaScript Design Patterns"
      });

      await request(app)
        .delete(`${route}/${_id}`)
        .expect(202);

      const book = await Book.findById(_id);
      expect(book).toBe(null);
    });

    test("returns 404 Not Found as there is no such book", done => {
      const _id = "5c8fb5c41529bf25dcba41a7";
      request(app)
        .delete(`${route}/${_id}`)
        .expect(404, done);
    });
  });
});
