const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.route("/").get((req, res, next) => {
  res.render("index.html");
});

const secret = "SECRET"; // should be in env file

router
  .route("/token")
  .get(async (req, res) => {
    const userData = { _id: "123" };
    const exp = { expiresIn: "24hr" };
    const token = await jwt.sign(userData, secret, exp);
    return res.status(200).json({ token });
  })
  .post(async (req, res) => {
    if (!req.headers.authorization) {
      res.sendStatus(401);
    }
    const token = req.headers.authorization.split("Bearer ")[1]; // "Bearer 218ue8htokenherefrombefore20172"
    const userData = await jwt.verify(token, secret);
    return res.status(200).json({ userData });
  });

router.route("/register").post(async (req, res) => {
  try {
    const user = new User(req.body);
    //before we save, we must wait for indexing of collection to finish
    await User.init();
    await user.save();
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
