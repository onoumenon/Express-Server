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
        expect(res.body.isbn).toEqual(expect.any(String));
        expect(res.body.title).toEqual(expect.any(String));
        expect(res.body.quantity).toEqual(expect.any(Number));
      });
  });

  //needs .catch because error is thrown by supertest when 403 (if not using done)
  test("Forbids access with wrong token", done => {
    request(app)
      .post(route)
      .set("Authorization", "Bearer wrong-token-name-here")
      .send({ title: "Handmaid's Tale", author: "Margaret Atwood" })
      .expect(403, done);
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

  //TO DO: Implement Tests Base on new commits

  xtest("Get a book", () => {
    return request(app)
      .get(route)
      .expect(200)
      .then(res => {
        expect(res.body.isbn).toEqual("9781593275846");
        expect(res.body.title).toEqual("Eloquent JavaScript, Second Edition");
        expect(res.body.quantity).toEqual(20);
      });
  });

  xtest("Patch a book", () => {
    return request(app)
      .patch(route)
      .set("Authorization", "Bearer token-name-here")
      .send({ quantity: 0 })
      .expect(202)
      .then(res => {
        expect(res.body.isbn).toEqual("9781593275846");
        expect(res.body.quantity).toEqual(0);
        expect(res.body.title).toEqual("Eloquent JavaScript, Second Edition");
      });
  });

  xtest("Put a book", () => {
    return request(app)
      .put(route)
      .set("Authorization", "Bearer token-name-here")
      .send({ quantity: 0 })
      .expect(202)
      .then(res => {
        expect(res.body.isbn).toEqual("9781593275846");
        expect(res.body.quantity).toEqual(0);
        expect(res.body.title).toBeUndefined();
      });
  });
});
