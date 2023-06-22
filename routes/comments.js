const express = require("express");
const router = express.Router();

const Comment = require("../schemas/comment.js");
const Post = require("../schemas/post.js");
const User = require("../schemas/user.js");
const authMiddleware = require("../middlewares/auth-middleware");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// 댓글 생성 API
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const { comment } = req.body;
    if (!ObjectId.isValid(postId)) {
        return res.status(400).json({ errorMessage: "ID 형식이 올바르지 않습니다." });
    }
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        }
        if (!req.body) {
            return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        if (!comment) {
            return res.status(400).json({ errorMessage: "댓글 내용을 입력해주세요." });
        }

        const { nickname } = await User.findById(userId);
        const createdComment = await Comment.create({ userId, nickname, comment, postId });

        res.status(201).json({ comment: createdComment, message: "댓글을 작성하였습니다." });
    } catch (err) {
        return res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." });
    }
});

// 댓글 목록 조회 API
router.get("/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params;

    if (!ObjectId.isValid(postId)) {
        return res.status(400).json({ errorMessage: "ID 형식이 올바르지 않습니다." });
    }
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        }

        const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

        const commentList = comments.map((comment) => {
            return {
                nickname: comment.nickname,
                comment: comment.comment,
                createdAt: comment.createdAt
            };
        });

        res.json({ data: commentList });
    } catch (err) {
        return res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다." });
    }
});

//댓글 수정 API
router.put("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId)) {
        return res.status(400).json({ errorMessage: "ID 형식이 올바르지 않습니다." });
    }
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        }
        const updatedComment = await Comment.findById(commentId);
        if (!updatedComment) {
            return res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." });
        }
        if (userId !== updatedComment.userId) {
            return res.status(403).json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
        }
        if (!req.body) {
            return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        if (!comment) {
            return res.status(412).json({ errorMessage: "댓글 내용을 입력해주세요" });
        }

        await Comment.updateOne({ _id: commentId }, { $set: { "comment": comment } });
        res.status(200).json({ message: "댓글을 수정하였습니다." });
    } catch (err) {
        return res.status(400).json({ errorMessage: "댓글 수정에 실패하였습니다." });
    }
});

//댓글 삭제 API
router.delete("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId)) {
        return res.status(400).json({ errorMessage: "ID 형식이 올바르지 않습니다." });
    }
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        }
        const deletedComment = await Comment.findById(commentId);
        if (!deletedComment) {
            return res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." });
        }
        if (userId !== deletedComment.userId) {
            return res.status(403).json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
        }

        await Comment.deleteOne({ _id: commentId });

        res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } catch (err) {
        return res.status(400).json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
});

module.exports = router;