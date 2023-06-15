const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect("mongodb://localhost:27017/spa_blog")
    .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("몽고DB 연결 에러", err);
});

module.exports = connect;