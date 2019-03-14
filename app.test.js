const request = require("supertest");
const app = require("./app");

describe("App", () => {
  test("Should display Homepage with 200 status code", done => {
    request(app)
      .get("/")
      .expect(200)
      .expect("Hello!", done);
  });
});
