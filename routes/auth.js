const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const User = require("../schemas/user");

// 로그인 API
router.post("/login", async (req, res) => {
    const { nickname, password } = req.body;
    try {
        const user = await User.findOne({ nickname });

        if (!user || password !== user.password) {
            res.status(412).json({
                errorMessage: "닉네임 또는 패스워드를 확인해주세요.",
            });
            return;
        }

        const token = jwt.sign(
            { userId: user.userId },
            "custom-secret-key",
        );

        res.cookie("Authorization", `Bearer ${token}`);
        res.status(200).json({ token });

    } catch (err) {
        return res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
    }
});

module.exports = router;