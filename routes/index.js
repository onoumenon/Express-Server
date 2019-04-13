const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

router.route("/").get((req, res, next) => {
  res.render("index.html");
});

const secret = process.env.SECRET;

router
  .route("/token")
  .get(async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error("You are not authorized");
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new Error("You are not authorized");
      }
      const userId = { user: user.id };
      const exp = { expiresIn: "24h" };
      const token = await jwt.sign(userId, secret, exp);
      return res.status(200).json({ token });
    } catch (err) {
      return res.status(500).json(err.message);
    }
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

router.route("/login").post(async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("You are not authorized");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("You are not authorized");
    }

    // res.cookie("cookie", "cookie text");
    return res.status(200).end("You are logged in");
  } catch (err) {
    return res.status(401).send(err.message);
  }
});

module.exports = router;
