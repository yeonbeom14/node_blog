const express = require("express");
const router = express.Router();

const Comment = require("../schemas/comment.js");
const Post = require("../schemas/post.js");

// 댓글 생성 API
router.post("/comments/:postId", async (req, res) => {
    const { postId } = req.params;
    const { user, password, content } = req.body;
    const createdAt = new Date();
    // params ID값 유효성
    if ((postId.length !== 24) || ((parseInt(postId, 16).toString(16)).length !== 24)) {
        return res.status(400).json({ success: false, errorMessage: "ID 형식이 올바르지 않습니다." });
    }
    const commentedPost = await Post.findById(postId);
    if (commentedPost === null) {
        return res.status(400).json({ success: false, errorMessage: "게시글 조회에 실패하였습니다." });
    }

    // body 입력값 유효성
    if (!content) {
        return res.status(400).json({ success: false, errorMessage: "댓글 내용을 입력해주세요." });
    }
    if (!user || !password) {
        return res.status(400).json({ success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
    }

    const postid = postId; //params ID값을 key값으로 할당
    const createdComment = await Comment.create({ user, password, content, postid, createdAt });

    res.status(201).json({ post: createdComment, success: true, message: "댓글을 생성하였습니다." });
});

// 댓글 목록 조회 API
router.get("/comments/:postId", async (req, res) => {
    const { postId } = req.params;
    // params ID값 유효성
    if ((postId.length !== 24) || ((parseInt(postId, 16).toString(16)).length !== 24)) {
        return res.status(400).json({ success: false, errorMessage: "ID 형식이 올바르지 않습니다." });
    }
    const lookPost = await Post.findById(postId);
    if (lookPost === null) {
        return res.status(400).json({ success: false, errorMessage: "게시글 조회에 실패하였습니다." });
    }

    const comments = await Comment.find({ postid: postId });

    const commentList = comments.map((comment) => {
        return {
            "commentId": comment._id,
            "user": comment.user,
            "content": comment.content,
            "createdAt": comment.createdAt
        };
    });
    // 작성 시간 기준 내림차순 정렬
    const sortList = commentList.sort((a, b) => (b.createdAt - a.createdAt));

    res.json({ data: sortList });
});

//댓글 수정 API
router.put("/comments/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { password, content } = req.body;
    const createdAt = new Date();
    // params ID값 유효성
    if ((commentId.length !== 24) || ((parseInt(commentId, 16).toString(16)).length !== 24)) {
        return res.status(400).json({ success: false, errorMessage: "ID 형식이 올바르지 않습니다." });
    }
    const updatedComment = await Comment.findById(commentId);
    if (updatedComment === null) {
        return res.status(400).json({ success: false, errorMessage: "댓글 조회에 실패하였습니다." });
    }

    // body 입력값 유효성, password 일치 확인
    if (!content) {
        return res.status(400).json({ success: false, errorMessage: "댓글 내용을 입력해주세요." });
    }
    if (!password) {
        return res.status(400).json({ success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
    }
    if (updatedComment.password !== password) {
        return res.status(400).json({ success: false, errorMessage: "비밀번호가 일치하지 않습니다." });
    }

    await Comment.updateOne({ _id: commentId },
        {
            $set: {
                "content": content,
                "createdAt": createdAt
            }
        });
    res.status(201).json({ success: true, message: "댓글을 수정하였습니다." });
});

//댓글 삭제 API
router.delete("/comments/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { password } = req.body;
    // params ID값 유효성
    if ((commentId.length !== 24) || ((parseInt(commentId, 16).toString(16)).length !== 24)) {
        return res.status(400).json({ success: false, errorMessage: "ID 형식이 올바르지 않습니다." });
    }
    const deletedComment = await Comment.findById(commentId);
    if (deletedComment === null) {
        return res.status(400).json({ success: false, errorMessage: "댓글 조회에 실패하였습니다." });
    }

    // password 유효성, 일치 확인
    if (!password) {
        return res.status(400).json({ success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
    }
    if (deletedComment.password !== password) {
        return res.status(400).json({ success: false, errorMessage: "비밀번호가 일치하지 않습니다." });
    }

    await Comment.deleteOne({ _id: commentId });

    res.json({ success: true, message: "댓글을 삭제하였습니다." });
});

module.exports = router;