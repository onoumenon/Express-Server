const app = require("./app");
const port = process.env.PORT || 8081;

app.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    console.log(`Server is running on Heroku with port no: ${port}`);
  } else {
    console.log(`Server is running on http://localhost:${port}`);
  }
});
