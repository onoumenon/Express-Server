const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Book = require("../models/Book");

const route = (params = "") => {
  const path = "/api/v1/books";
  return `${path}/${params}`;
};

describe("Books", () => {
  let mongod;
  let db;

  beforeAll(async () => {
    jest.setTimeout(120000);
    mongod = new MongoMemoryServer();
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
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
    await mongod.stop();
  });

  describe("[GET] Search for books", () => {
    test("returns all books", () => {
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

      return request(app)
        .get(route())
        .expect("content-type", /json/)
        .expect(200)
        .then(res => {
          const books = res.body;
          books.forEach((book, index) => {
            expect(book.title).toBe(expectedBooks[index].title);
            expect(book.author).toBe(expectedBooks[index].author);
          });
        });
    });

    test("returns books matching the title query", () => {
      return request(app)
        .get(route())
        .query({ title: "Learning JavaScript Design Patterns" })
        .expect("content-type", /json/)
        .expect(200)
        .then(res => {
          const book = res.body[0];
          expect(book.title).toEqual("Learning JavaScript Design Patterns");
        });
    });

    test("returns books matching the author query", () => {
      return request(app)
        .get(route())
        .query({ author: "Addy Osmani" })
        .expect("content-type", /json/)
        .expect(200)
        .then(res => {
          const book = res.body[0];
          expect(book.title).toEqual("Learning JavaScript Design Patterns");
        });
    });
  });

  describe("[POST] Creates a new book", () => {
    test("denies access when no token is given", () => {
      return request(app)
        .post(route())
        .send({
          isbn: "9781449331818",
          title: "Learning JavaScript Design Patterns",
          author: "Addy Osmani"
        })
        .catch(err => {
          expect(err.status).toBe(403);
        });
    });

    test("denies access when invalid token is given", () => {
      return request(app)
        .post(route())
        .set("Authorization", "Bearer some-invalid-token")
        .send({
          isbn: "9781449331818",
          title: "Learning JavaScript Design Patterns",
          author: "Addy Osmani"
        })
        .catch(res => {
          expect(res.status).toBe(403);
        });
    });

    test("creates a new book record in the database", async () => {
      const res = await request(app)
        .post(route())
        .set("Authorization", "Bearer token-name-here")
        .send({
          isbn: "9781449331818",
          title: "Learning JavaScript Design Patterns",
          author: "Addy Osmani"
        })
        .expect(201);

      expect(res.body.title).toBe("Learning JavaScript Design Patterns");
      expect(res.body.author).toBe("Addy Osmani");

      const book = await Book.findOne({
        title: "Learning JavaScript Design Patterns"
      });
      expect(book.title).toBe("Learning JavaScript Design Patterns");
      expect(book.author).toBe("Addy Osmani");
    });
  });

  describe("[PUT] Edits an existing book", () => {
    test("edits a book's title and author", async () => {
      const { _id } = await Book.findOne({
        title: "Learning JavaScript Design Patterns"
      });

      const res = await request(app)
        .put(route(_id))
        .set("Authorization", "Bearer token-name-here")
        .send({
          isbn: "9781449331818",
          title: "Learning JavaScript Design Patterns",
          author: "Edit here"
        })
        .expect(202);

      expect(res.body).toEqual(
        expect.objectContaining({
          title: "Learning JavaScript Design Patterns",
          author: "Edit here"
        })
      );
    });

    test("returns 404 Status when editing non-existing book", () => {
      const id = "100";
      return request(app)
        .put(route(id))
        .set("Authorization", "Bearer token-name-here")
        .send({
          _id: 100,
          title: "The Perennial Philosophy",
          author: "Aldous Huxley"
        })
        .catch(res => {
          expect(res.status).toBe(404);
        });
    });
  });

  describe("[DELETE] Removes an existing book", () => {
    test("removes a book from the database", async () => {
      const { _id } = await Book.findOne({
        title: "Learning JavaScript Design Patterns"
      });

      await request(app)
        .delete(route(_id))
        .set("Authorization", "Bearer token-name-here")
        .expect(202);

      const book = await Book.findById(_id);
      expect(book).toBe(null);
    });

    test("returns 404 Not Found as there is no such book", done => {
      const _id = "5c8fb5c41529bf25dcba41a7";
      request(app)
        .delete(route(_id))
        .set("Authorization", "Bearer token-name-here")
        .expect(404, done);
    });
  });
});
