const request = require("supertest");
const app = require("../app");

const sampleBooks = require("../booksService");

sampleBook = {
  quantity: 0,
  isbn: "123",
  title: "Hey"
};

describe("/books", () => {
  const route = "/books";
  test("Get all books", done => {
    request(app)
      .get(route)
      .expect(200)
      .expect("Content-Type", /json/)
      .expect(sampleBooks, done);
  });

  test("Post a book", () => {
    return request(app)
      .post(route)
      .set("Authorization", "Bearer token-name-here")
      .set("Content-Type", "application/json")
      .send(sampleBook)
      .expect(201)
      .then(res => {
        expect(res.body.isbn).toEqual("123");
        expect(res.body.title).toEqual("Hey");
        expect(res.body.quantity).toEqual(0);
      });
  });

  //needs ok then because error is thrown when 403
  test("Forbids access with wrong token", () => {
    return request(app)
      .post(route)
      .send({ title: "Hey", author: "hey" })
      .ok(res => res.status === 403)
      .then(res => {
        expect(res.status).toBe(403);
      });
  });

  test("Grants access with authorization token", () => {
    return request(app)
      .post(route)
      .set("Authorization", "Bearer token-name-here")
      .send({ title: "Handmaid's Tale", author: "Margaret Atwood" })
      .expect(201)
      .then(res => {
        expect(res.body).toEqual({
          title: "Handmaid's Tale",
          author: "Margaret Atwood"
        });
      });
  });
});

describe("/books/:isbn", () => {
  const isbn = "9781593275846";
  const route = `/books/${isbn}`;
  test("Delete a Book", done => {
    request(app)
      .delete(route)
      .set("Authorization", "Bearer token-name-here")
      .expect(202)
      .expect(/Deleted Book of isbn/, done);
  });

  test("Get a book", () => {
    return request(app)
      .get(route)
      .expect(200)
      .then(res => {
        expect(res.body.isbn).toEqual("9781593275846");
        expect(res.body.title).toEqual("Eloquent JavaScript, Second Edition");
        expect(res.body.quantity).toEqual(20);
      });
  });
});
