const express = require("express");
const app = express();
const port = 3000;

const indexRouter = require("./routes/index.js");
const postsRouter = require("./routes/posts.js");
const commentsRouter = require("./routes/comments.js");
const usersRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");
const connect = require("./schemas");
connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", [indexRouter, postsRouter, commentsRouter, usersRouter, authRouter]);

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});