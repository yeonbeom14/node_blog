const express = require("express");
const router = express.Router();

const User = require("../schemas/user.js");

// 회원가입 API
router.post("/signup", async (req, res) => {
    const { nickname, password, confirm } = req.body;

    const nicknameReg = /^[a-zA-Z0-9]{3,}$/; //nickname 형식 검사
    const passwordReg = /^.{4,}$/; //password 형식 검사

    try {
        if (!nicknameReg.test(nickname)) {
            return res.status(412).json({ errorMessage: "닉네임의 형식이 일치하지 않습니다." });
        }
        if (password !== confirm) {
            return res.status(412).json({ errorMessage: "패스워드가 일치하지 않습니다." });
        }
        if (!passwordReg.test(password)) {
            return res.status(412).json({ errorMessage: "패스워드 형식이 일치하지 않습니다." });
        }
        if (password.includes(nickname)) {
            return res.status(412).json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
        }

        const existsUsers = await User.findOne({ nickname });
        if (existsUsers) {
            return res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
        }

        const user = new User({ nickname, password });
        await user.save();

        res.status(201).json({ message: "회원 가입에 성공하였습니다." });

    } catch (err) {
        return res.status(400).json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
    }
});

module.exports = router;