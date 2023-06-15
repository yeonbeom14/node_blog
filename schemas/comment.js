const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  password: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  postid: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  }
});

module.exports = mongoose.model("Comment", commentSchema);