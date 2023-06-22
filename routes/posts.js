const express = require("express");
const router = express.Router();

const Post = require("../schemas/post.js");
const Comment = require("../schemas/comment.js");
const User = require("../schemas/user.js");
const authMiddleware = require("../middlewares/auth-middleware");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// 게시글 작성 API
router.post("/posts", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;
  try {
    if (!req.body) {
      return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }
    if (!title) {
      return res.status(412).json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    }
    if (!content) {
      return res.status(412).json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    }

    const { nickname } = await User.findById(userId);
    const createdPost = await Post.create({ userId, nickname, title, content });
    res.status(201).json({ post: createdPost, message: "게시글 작성에 성공하였습니다." });

  } catch (err) {
    return res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

// 게시글 전체 조회 API
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });

    const postList = posts.map((post) => {
      return {
        title: post.title,
        nickname: post.nickname,
        createdAt: post.createdAt
      };
    });

    res.json({ posts: postList });
  } catch (err) {
    return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 상세 조회 API
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  // params ID값 유효성 
  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ errorMessage: "ID 형식이 올바르지 않습니다." });
  } else {
    const detailPost = await Post.findById(postId);

    if (detailPost) {
      return res.json({
        post: {
          title: detailPost.title,
          nickname: detailPost.nickname,
          createdAt: detailPost.createdAt,
          content: detailPost.content,
        }
      });
    } else {
      return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
    }
  }
});

//게시글 수정 API
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ errorMessage: "ID 형식이 올바르지 않습니다." });
  }
  try {
    const updatedPost = await Post.findById(postId);
    if (!updatedPost) {
      return res.status(400).json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    if (!req.body) {
      return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }
    if (!title) {
      return res.status(412).json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    }
    if (!content) {
      return res.status(412).json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    }
    if (userId !== updatedPost.userId) {
      return res.status(403).json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
    }

    await Post.updateOne({ _id: postId },
      {
        $set: {
          "title": title,
          "content": content,
        }
      });
    return res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (err) {
    return res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다." });
  }
});

//게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ errorMessage: "ID 형식이 올바르지 않습니다." });
  }
  try {
    const deletedPost = await Post.findById(postId);
    if (!deletedPost) {
      return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    if (userId !== deletedPost.userId) {
      return res.status(403).json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." });
    }

    await Post.deleteOne({ _id: postId });
    // 삭제할 postId 해당 게시글에 달린 댓글 전체 삭제
    await Comment.deleteMany({ postId });

    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (err) {
    return res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다." });
  }
});

module.exports = router;