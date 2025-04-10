const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// POST /login
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username or Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login", {
        error: errors.mapped(),
        username: req.body.username,
      });
    }

    const { username, password, rememberMe } = req.body;

    try {
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
      });

      if (!user) {
        return res.render("login", {
          error: { username: { msg: "Invalid username or password." } },
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render("login", {
          error: { password: { msg: "Invalid username or password." } },
        });
      }

      user.lastLogin = new Date();
      await user.save();

      req.session.user = {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
      };

      // ✅ ตั้งค่าอายุ session cookie ตาม "rememberMe"
      if (rememberMe) {
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // 7 วัน
      } else {
        req.session.cookie.expires = false; // หมดอายุเมื่อปิด browser
      }

      await req.session.save();
      console.log("✅ User logged in:", req.session.user);

      return res.redirect("/");
    } catch (error) {
      console.error("❌ Error during login:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
