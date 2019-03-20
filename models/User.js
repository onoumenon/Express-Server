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

// UserSchema.pre(‘save’, {
//     var user = this;
//     // only hash the password if it has been modified (or is new)
//     if(!user.isModified('password')) return next();

// // generate a salt
// bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
//     if (err) return next(err);

//     // hash the password along with our new salt
//     bcrypt.hash(user.password, salt, function (err, hash) {
//         if (err) return next(err);

//         // override the cleartext password with the hashed one
//         user.password = hash;
//         next();
//     });
