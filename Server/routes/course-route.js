const { course } = require("../models");

const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("course router => req...");
  next();
});
// 所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (error) {
    return res.status(500).send(error);
  }
});

//instructor id尋找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  console.log("123");
  try {
    let { _instructor_id } = req.params;
    let coursesFound = await Course.find({ instructor: _instructor_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFound);
  } catch (error) {
    return res.send(error);
  }
});

//學生id尋找課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  
  let courseFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();

  return res.send(courseFound);
});

//課程名稱尋找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;

  try {
    let courseFound = await Course.find({ title: name })
      .populate("instructor", ["email", "username"])
      .exec();
    // console.log("123");
    console.log(courseFound);
    return res.send(courseFound);
  } catch (error) {
    return res.status(500).send(error);
  }
});

//課程id尋找課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["email"])
      .exec();
    return res.send(courseFound);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 新增課程
router.post("/", async (req, res) => {
  // 驗證
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res.status(400).send("只有講師允許");
  }

  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let savedCourse = await newCourse.save();
    return res.send("課程創建");
  } catch (error) {
    return res.status(500).send("無法創建...");
  }
});

// 學生id註冊課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id);
    await course.save();
    return res.send("註冊完成");
  } catch (error) {
    return res.send("");
  }
});

router.patch("/:_id", async (req, res) => {
  // 驗證數據
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { _id } = req.params;
  //確認課程存在
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(400).send("課程不存在");
    }

    // 使用者為開課者
    if (courseFound.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findByIdAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({
        message: "已修改",
        updatedCourse,
      });
    } else {
      return res.status(403).send("只有課程使用者");
    }
  } catch (error) {
    return res.status(500).send("error");
  }
});

router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  //確認課程存在
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(400).send("課程不存在");
    }

    // 使用者為開課者
    if (true) {
      await Course.deleteOne({ _id }).exec();
      return res.send("已刪除");
    } else {
      return res.status(403).send("只有課程使用者");
    }
  } catch (error) {
    return res.status(500).send("error");
  }
});

module.exports = router;
