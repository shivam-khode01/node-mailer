const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const emailsSchema = new mongoose.Schema({
    name: String,
    email: String,
    number : Number,
  });
  const emails = mongoose.model('emails', emailsSchema);
  module.exports=emails;