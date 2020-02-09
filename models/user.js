const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const password = (password) => {
  return bcrypt.hashSync(password, 12);
}

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, set: password },
  registered: { type: Date, default: "01.01.2153" },
  aboutMe: { type: String, required: false, max: 500, default: "" },
  avatar: { type: String, required: true, default: "avatar.png" },
  gamesPlayed: { type: Number, required: false, default: 0 },
  gamesWon: { type: Number, required: false, default: 0 },

});

UserSchema.methods.validPassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};


// UserSchema.virtual("password").set((value) => {
//   this.passwordHash = bcrypt.hashSync(value, 12);
// });

const User = mongoose.model("User", UserSchema);
module.exports = User;
