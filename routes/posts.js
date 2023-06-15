const express = require("express");
const router = express.Router();

const Post = require("../schemas/post.js");
const Comment = require("../schemas/comment.js");

// 게시글 작성 API
router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;
  const createdAt = new Date();

  // body 입력값 유효성
  if (!user || !password || !title || !content) {
    return res.status(400).json({ success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
  }

  const createdPost = await Post.create({ user, password, title, content, createdAt });

  res.status(201).json({ post: createdPost, success: true, message: "게시글을 생성하였습니다." });
});

// 게시글 전체 조회 API
router.get("/posts", async (req, res) => {
  const posts = await Post.find({});

  const postList = posts.map((post) => {
    return {
      "postId": post._id,
      "user": post.user,
      "title": post.title,
      "createdAt": post.createdAt
    };
  });
  // 작성 시간 기준 내림차순 정렬
  const sortList = postList.sort((a, b) => (b.createdAt - a.createdAt));

  res.json({ data: sortList });
});

// 게시글 상세 조회 API
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;

  // params ID값 유효성 
  // 몽고DB ID값은 항상 24자리,  ID값은 16진수 형식이기 때문에 ID>정수>16진수 변환 하였을때 24자리 유지 되어야함
  if ((postId.length !== 24) || ((parseInt(postId, 16).toString(16)).length !== 24)) {
    return res.status(400).json({ success: false, errorMessage: "ID 형식이 올바르지 않습니다." });
  }
  const detail = await Post.findById(postId);
  // ID값 형식은 맞지만 DB에 존재하지않는 ID일때 findById()에서 null값 반환
  if (detail === null) {
    return res.status(400).json({ success: false, errorMessage: "게시글 조회에 실패하였습니다." });
  }
  //ID값 유효성 종료

  const [postDetail] = [detail].map((post) => {
    return {
      "postId": post._id,
      "user": post.user,
      "title": post.title,
      "content": post.content,
      "createdAt": post.createdAt
    };
  });
  res.json({ data: postDetail });
});

//게시글 수정 API
router.put("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const { user, password, title, content } = req.body;
  const createdAt = new Date();
  // params ID값 유효성
  if ((postId.length !== 24) || ((parseInt(postId, 16).toString(16)).length !== 24)) {
    return res.status(400).json({ success: false, errorMessage: "ID 형식이 올바르지 않습니다." });
  }
  const updatedPost = await Post.findById(postId);
  if (updatedPost === null) {
    return res.status(400).json({ success: false, errorMessage: "게시글 조회에 실패하였습니다." });
  }

  // body 입력값 유효성, password 일치 확인
  if (!user || !password || !title || !content) {
    return res.status(400).json({ success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
  }
  if (updatedPost.password !== password) {
    return res.status(400).json({ success: false, errorMessage: "비밀번호가 일치하지 않습니다." });
  }

  await Post.updateOne({ _id: postId },
    {
      $set: {
        "title": title,
        "content": content,
        "createdAt": createdAt
      }
    });
  res.status(201).json({ success: true, message: "게시글을 수정하였습니다." });
});

//게시글 삭제 API
router.delete("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const { password } = req.body;
  // params ID값 유효성
  if ((postId.length !== 24) || ((parseInt(postId, 16).toString(16)).length !== 24)) {
    return res.status(400).json({ success: false, errorMessage: "ID 형식이 올바르지 않습니다." });
  }
  const deletedPost = await Post.findById(postId);
  if (deletedPost === null) {
    return res.status(400).json({ success: false, errorMessage: "게시글 조회에 실패하였습니다." });
  }

  // password 유효성, 일치 확인
  if (!password) {
    return res.status(400).json({ success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
  }
  if (deletedPost.password !== password) {
    return res.status(400).json({ success: false, errorMessage: "비밀번호가 일치하지 않습니다." });
  }

  await Post.deleteOne({ _id: postId });
  // 삭제할 postId 해당 게시글에 달린 댓글 전체 삭제
  await Comment.deleteMany({ postid: postId });

  res.json({ success: true, message: "게시글을 삭제하였습니다." });
});

module.exports = router;