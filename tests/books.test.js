const request = require("supertest");
const app = require("../app");

const sampleBooks = require("../booksService");

sampleBook = {
  quantity: 0,
  isbn: "9781491950297",
  title: "Programming JavaScript Applications"
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

  test("Post a book that does not exists, returns 201 status", () => {
    return request(app)
      .post(route)
      .set("Authorization", "Bearer token-name-here")
      .set("Accept", "application/json")
      .send(sampleBook)
      .expect("Content-Type", /json/)
      .expect(201)
      .then(res => {
        expect(res.body.isbn).toEqual(expect.any(String));
        expect(res.body.title).toEqual(expect.any(String));
        expect(res.body.quantity).toEqual(expect.any(Number));
      });
  });

  test("Posting existing book responded with 405 status", done => {
    return request(app)
      .post(route)
      .set("Authorization", "Bearer token-name-here")
      .send(sampleBook)
      .expect(405, done);
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

  test("Patch a book", () => {
    return request(app)
      .patch(route)
      .set("Authorization", "Bearer token-name-here")
      .send({ quantity: 0 })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(202)
      .then(res => {
        expect(res.body.isbn).toEqual("9781593275846");
        expect(res.body.quantity).toEqual(0);
        expect(res.body.title).toEqual("Eloquent JavaScript, Second Edition");
      });
  });

  test("Put a book with only quantity, returns other fields except isbn as empty", () => {
    return request(app)
      .put(route)
      .set("Authorization", "Bearer token-name-here")
      .send({ quantity: 0 })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(202)
      .then(res => {
        expect(res.body.isbn).toEqual("9781593275846");
        expect(res.body.quantity).toEqual(0);
        expect(res.body.title).toBeUndefined();
      });
  });

  test("Delete a Book that exists", done => {
    request(app)
      .delete(route)
      .set("Authorization", "Bearer token-name-here")
      .expect(202)
      .expect(/Deleted Book of isbn/, done);
  });

  test("Delete a Book that does not exists returns 404", done => {
    request(app)
      .delete(route)
      .set("Authorization", "Bearer token-name-here")
      .expect(404, done);
  });

  test("Getting a Deleted Book returns 404 status", done => {
    return request(app)
      .get(route)
      .expect(404, done);
  });
});
