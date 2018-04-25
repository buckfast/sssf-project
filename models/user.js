const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const password = (password) => {
  return bcrypt.hashSync(password, 12);
}

const UserSchema = new Schema({
  username: {type: String, required: true, unique: true},
  passwordHash: {type: String, required: true, set: password},
});

UserSchema.methods.validPassword = (password) => {
  return bcrypt.compareSync(password, this.passwordHash);
};


// UserSchema.virtual("password").set((value) => {
//   this.passwordHash = bcrypt.hashSync(value, 12);
// });

const User = mongoose.model("User", UserSchema);
module.exports = User;
