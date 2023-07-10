import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../services/course.service";

const CourseComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const handleTakeToLogin = () => {
    navigate("/login");
  };

  const [courseData, setCourseData] = useState(null);
  useEffect(() => {
    let _id;
    if (currentUser) {
      _id = currentUser.user._id;

      if (currentUser.user.role == "instructor") {
        CourseService.get(_id)
          .then((data) => {
            setCourseData(data.data);
          })
          .catch((e) => {
            console.log(e);
          });
      } else if (currentUser.user.role == "student") {
        console.log("學生...");
        CourseService.getEnrolledCourses(_id)
          .then((data) => {
            console.log(data);
            setCourseData(data.data);
          })
          .catch((e) => {
            console.log("e");
          });
      }
    }
  }, []);

  return (
    <div style={{ padding: "3rem" }}>
      {!currentUser && (
        <div>
          <p>需登入</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleTakeToLogin}
          >
            回到登入頁面
          </button>
        </div>
      )}
      {currentUser && currentUser.user.role == "instructor" && (
        <div>
          <h1>歡迎講師</h1>
        </div>
      )}
      {currentUser && currentUser.user.role == "student" && (
        <div>
          <h1>歡迎學生</h1>
        </div>
      )}
      {currentUser && courseData && courseData.length !== "0" && (
        <div className="" style={{ display: "flex", flexWrap: "wrap" }}>
          {courseData.map((course) => {
            return (
              <div className="card" style={{ width: "18rem", margin: "1rem" }}>
                <div className="card-body">
                  <h5 className="card-title" key="{course.title}">
                    課程名稱:{course.title}
                  </h5>
                  <p
                    style={{ margin: "0.5rem 0" }}
                    className="card-text"
                    key="{course.description}"
                  >
                    {course.description}
                  </p>
                  <p
                    style={{ margin: "0.5rem 0" }}
                    className="card-text"
                    key="{course.students.length}"
                  >
                    學生人數:{course.students.length}
                  </p>
                  <p
                    style={{ margin: "0.5rem 0" }}
                    className="card-text"
                    key="{course.price}"
                  >
                    課程價錢:{course.price}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseComponent;
