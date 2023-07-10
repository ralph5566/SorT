const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRouter = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const path = require("path");
const port = process.env.PORT || 8080; // process.env.PORT Heroku自動設定

mongoose
  .connect("mongodb://127.0.0.1/GoogleDB")
  .then(() => {
    console.log("connect mongodb...");
  })
  .catch((e) => console.log(e));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "build")));

app.use("/api/user", authRouter);
// JWT保護
app.use(
  "/api/course",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

if (
  process.env.NODE_ENV == "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(___dirname, "client", "build", "index.html"));
  });
}

// 登入系統 才能新增或註冊課程  JWT

app.listen(8080, () => console.log("8080 running..."));

// app.listen(port, () => console.log("8080 running..."));
