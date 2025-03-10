import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import GoBack from "../componets/GoBack";
import Sem from "../componets/sem";

const Sub = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const course = new URLSearchParams(location.search).get("course");
  // State for courses, selected course, semesters, and selected semester
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSem, setSelectedSem] = useState(null);

  // Fetch all courses on mount
  useEffect(() => {
    axios
      .post("https://pixel-classes.onrender.com/api/home/courses")
      .then((response) => {
        console.log("Courses API Response:", response.data);
        if (
          response.data.CourseList &&
          Array.isArray(response.data.CourseList)
        ) {
          setCourses(response.data.CourseList);
          const initialCourse = response.data.CourseList.find(c => c.name === course) || response.data.CourseList[0];
          setSelectedCourse(initialCourse); // Default to the course from URL or first course
      } else {
          console.error("Invalid Course List format");
        }
      })
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  // Fetch semester data for the selected course
  useEffect(() => {
    if (!selectedCourse) return;
    
    setLoading(true); // Set loading to true before starting the fetch
  
    setTimeout(() => {
      axios
        .get("https://pixel-classes.onrender.com/api/home/QuePdf/")
        .then((response) => {
          console.log("Semesters API Response:", response.data);
          if (Array.isArray(response.data)) {
            const filteredSemesters = response.data.filter(
              (item) => item.course === selectedCourse.id
            );
            console.log("Filtered Semesters:", filteredSemesters);
            setSemesters(filteredSemesters);
          } else {
            console.error("Invalid semester data format");
          }
          setLoading(false); // Set loading to false after data is fetched
        })
        .catch((error) => {
          console.error("Error fetching semesters:", error);
          setLoading(false); // Set loading to false in case of error
        });
    }, 1000);
  }, [selectedCourse]);

  // Handle semester selection (toggle)
  const handleSemesterClick = (semester) => {
    setSelectedSem(semester === selectedSem ? null : semester);
    console.log("Selected Semester:", semester);
  };

// Function to check authentication status based on access_token
const getAccessTokenFromCookies = () => {
  const accessToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1];

  console.log("Access Token:", accessToken);
  return accessToken || null; // Return null if not found
};

  // Handle subject click
  const handleLinkClick = (event, item) => {
    if (!getAccessTokenFromCookies()) {
      console.log("User not authenticated, redirecting to login...");
      event.preventDefault();
      navigate("/login");
    } else {
      navigate(`/ns?course=${course}&id=${item.id}`);
    }
  };

  return (
    <div className="text-center">
      <GoBack />
      <div className="bg-white p-4 w-full">
        <h1 className="text-4xl text-left font-bold">
          📘 {course} 
        </h1>
       
      </div>
      <p className="mt-4 text-left pl-3 text-lg">Select your subject</p>

      {/* Semester Tabs */}
      <div className="z-1 rounded-t-lg mr-2 ml-2 mt-4 bg-white">
  <div className="block shadow-[inset_0px_4px_4px_rgba(0,0,0)] overflow-hidden rounded-t-3xl">
    <div className="p-4 mr-2 rounded-t-lg flex overflow-x-auto gap-6 w-full min-h-[50px] whitespace-nowrap">
      {
        loading ? (
          <div className="text-2xl p-10 text-red-500">Loading...</div>
        ) : (
          selectedCourse?.number_sem > 0 ? (
          Array.from({ length: selectedCourse.number_sem }, (_, index) => (
            <button
              className={`px-4 py-2 rounded-md shadow-md transition-all ${
                selectedSem === index + 1
                  ? "shadow-lg border-2 border-black"
                  : "shadow-md border border-gray-300"
              }`}
              key={index}
              onClick={() => handleSemesterClick(index + 1)}
            >
              <Sem s={index + 1} />
            </button>
          ))
        
      ) : (
        <p className="text-gray-500">No semesters available</p>
      )
      
      
      )}
    </div>

    {/* Semester Content */}
    <div className="mt-6 space-y-4 p-4 h-dvh overflow-y-auto">
      {selectedSem
        ? semesters
            .filter((item) => Number(item.sem) === Number(selectedSem))
            .map((item, index) => (
              <div
                key={index}
                className="block cursor-pointer"
                onClick={(event) => {
                  console.log("Div clicked!", item); // Debugging
                  handleLinkClick(event, item);
                }}
              >
                <div className="flex items-center flex-wrap justify-between p-4 bg-gray-200 shadow-md rounded-lg">
                  <span className="text-lg font-medium">
                    {item.name || "Unknown Subject"}
                  </span>
                  <p className="text-sm text-gray-600">Semester {item.sem}</p>
                  <p className="text-sm text-gray-600">Div-{item.div}</p>
                  <p className="text-sm text-gray-600">Year-{item.year}</p>
                </div>
              </div>
            ))
        : semesters.map((item, index) => (
            <div
              key={index}
              className="block cursor-pointer"
              onClick={(event) => {
                console.log("Div clicked!", item);
                handleLinkClick(event, item);
              }}
            >
              <div className="flex items-center flex-wrap justify-between p-4 bg-gray-200 shadow-md rounded-lg">
                <span className="text-lg font-medium">
                  {item.name || "Unknown Subject"}
                </span>
                <p className="text-sm text-gray-600">Semester {item.sem}</p>
                <p className="text-sm text-gray-600">Div-{item.div}</p>
                <p className="text-sm text-gray-600">Year-{item.year}</p>
              </div>
            </div>
          ))}
    </div>
  </div>
</div>
    </div>
  );
};

export default Sub;