const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const courseValidation = require("../validation").courseValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log("auth req...");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("auth router OK");
});

router.post("/register", async (req, res) => {
  console.log("註冊中...");
  console.log(registerValidation(req.body));
  // 確認數據規範
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //確認信箱註冊
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("已註冊...");

  // 新用戶
  let { email, username, password, role } = req.body;
  let newUser = new User({ email, username, password, role });
  try {
    let savedUser = await newUser.save();
    return res.send({
      msg: "成功儲存",
      savedUser,
    });
  } catch (e) {
    res.status(500).send("無法儲存...");
  }
});

router.post("/login", async (req, res) => {
  // 確認數據規範
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //確認信箱註冊
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) return res.status(401).send("無法找到使用者...");

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);
    if (isMatch) {
      // Json Web Token
      const tokenObj = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObj, process.env.PASSPORT_SECRET);
      return res.send({
        message: "登入成功",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

module.exports = router;
