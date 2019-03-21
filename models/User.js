const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.pre("save", function(next) {
  // only hash if password is modified (avoids double-hashing)
  if (!this.isModified("password")) return next();

  bcrypt
    .hash(this.password, 10)
    .then(hash => {
      this.password = hash;
      next();
    })
    .catch(err => {
      return next(err);
    });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
