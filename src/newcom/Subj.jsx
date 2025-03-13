import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sem from "../componets/sem";
import GoBack from "../componets/GoBack";
import "./style/sub.css";


const Sub = () => {
  const location = useLocation();
    const courseName = new URLSearchParams(location.search).get('course');
    console.log(courseName);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedSem, setSelectedSem] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await axios.get('https://pixel-classes.onrender.com/api/home/courses');
                const data = response.data;
                console.log('Fetched data:', data);

                if (data.CourseList && Array.isArray(data.CourseList)) {
                    const course = data.CourseList.find(course => course.name === courseName);
                    if (course) {
                        console.log('Course found:', course);
                        console.log('Semester:', course.number_sem);
                        setSelectedCourse(course);
                        setSemesters(Array.isArray(course.number_sem) ? course.number_sem : [course.number_sem]);
                    } else {
                        console.log('Course not found');
                    }
                } else {
                    console.error('Unexpected data format:', data);
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };

        if (courseName) {
            fetchCourseDetails();
        }
    }, [courseName]);
// Function to check authentication status based on access_token
const getAccessTokenFromCookies = () => {
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];
  
    console.log("Access Token:", accessToken);
    return accessToken || null; // Return null if not found
  };
    const handleLinkClick = (event, item) => {
        if (!getAccessTokenFromCookies()) {
          console.log("User not authenticated, redirecting to login...");
          event.preventDefault();
          navigate("/login");
        } else {
            console.log(`/ns?course=${selectedCourse.name}&id=${item}`)
          navigate(`/ns?course=${selectedCourse.name}&id=${item}`);
        }
      };
    
  return (
    <div className="text-center">
      <GoBack />
      <div className="bg-white p-4 w-full">
        <h1 className="text-4xl text-left font-bold">
          📘 {courseName} 
        </h1>
      </div>
      <p className="mt-4 text-left pl-3 text-lg">Select Semester</p>

      {/* Semester Tabs */}
      <div className="z-1 rounded-t-lg -m-sm ">
        <div className="block bg-[#D9D9D9]  h-screen shadow-[inset_0px_4px_4px_rgba(0,0,0)] overflow-hidden rounded-t-3xl">
      
            {/* <h1>Select Semester</h1> */}
            {selectedCourse ? (
              <>
          <div className="p-4 -z-2 mr-2 rounded-t-lg flex overflow-x-auto gap-6 w-full min-h-[50px] whitespace-nowrap">
                    {/* <p>Course: {selectedCourse.name}</p> */}
                    <div className="flex gap-4">
                        {selectedCourse?.number_sem > 0 ? (
                            Array.from({ length: selectedCourse.number_sem }, (_, index) => (
                              <button
                              className={`px-4 py-2 transition-all ${
                                  selectedSem === index + 1
                                      ? "border-2 border-black bg-gray-100 rounded-lg shadow-md"
                                      : ""
                              }`}
                              key={index}
                              onClick={async () => {
                                  const newSelectedSem = index + 1;
                                  setSelectedSem(newSelectedSem);
                                  if (newSelectedSem) {
                                      try {
                                          const response = await axios.post('https://pixel-classes.onrender.com/api/home/QuePdf/Get_Subjact', {
                                              sem: newSelectedSem,
                                              course_name: selectedCourse.name,
                                          });
                                          
                                          const result = response.data;
                                          setApiResponse(result);
                                      } catch (error) {
                                          console.error('Error sending data to API:', error);
                                      }
                                  } else {
                                      console.log('Please select a semester');
                                  }
                              }}
                          >
                              <Sem s={index + 1} />
                          </button>
                            ))
                          ) : (
                            <p className="text-gray-500">No semesters available</p>
                          )}
                          </div>
                    </div>
                    <div className="flex flex-col">
                      
                    {selectedSem && apiResponse && (
                        <div className="flex flex-col ">
                            <p className="text-red-500 mb-6 dark:text-black">Choose your Subject</p>
                            {/* <pre>{JSON.stringify(apiResponse, null, 2)}</pre> */}
                            <ul className="flex flex-col gap-2 items-baseline pl-4">
                                {apiResponse.map((subject) => (
                                    <li className="p-4 bg-white dark:bg-black dark:text-white rounded-xl cursor-pointer"  onClick={(event) => {
                                        console.log("Div clicked!", subject.id);
                                        handleLinkClick(event, subject.id);
                                      }} onkey={subject.id}>{subject.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    </div>
                </>
            ) : (
                <p className="cursor-wait ">Loading course details...</p>
            )}
        </div>
  </div>
</div>

  );
};

export default Sub;