import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sem from "../componets/sem";

const Selectsub = () => {
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
        <div>
            <h1>Select Semester</h1>
            {selectedCourse ? (
                <>
                    <p>Course: {selectedCourse.name}</p>
                    <div>
                        {selectedCourse?.number_sem > 0 ? (
                            Array.from({ length: selectedCourse.number_sem }, (_, index) => (
                                <button
                                    className={`px-4 py-2  transition-all ${
                                        selectedSem === index + 1
                                            ? " border-2 border-black bg-gray-100 rounded-lg shadow-md"
                                            : ""
                                    }`}
                                    key={index}
                                    onClick={() => setSelectedSem(index + 1)}
                                >
                                    <Sem s={index + 1} />
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500">No semesters available</p>
                        )}
                    </div>
                    <br />
                    <button
                        onClick={async () => {
                            console.log(selectedSem);
                            console.log(selectedCourse.name);
                            if (selectedSem) {
                                try {
                                    const response = await axios.post('https://pixel-classes.onrender.com/api/home/QuePdf/Get_Subjact', {
                                        sem: selectedSem,
                                        course_name: selectedCourse.name,
                                    });
                                    console.log("Div clicked!");
                                    console.log(selectedSem);
                                    console.log(selectedCourse.name);
                                    const result = response.data;
                                    console.log('API response:', result);
                                    setApiResponse(result);
                                } catch (error) {
                                    console.error('Error sending data to API:', error);
                                }
                            } else {
                                console.log('Please select a semester');
                            }
                        }}
                    >
                        Submit
                    </button>
                    {selectedSem && apiResponse && (
                        <div>
                            <h2>API Response</h2>
                            {/* <pre>{JSON.stringify(apiResponse, null, 2)}</pre> */}
                            <ul>
                                {apiResponse.map((subject) => (
                                    <li  onClick={(event) => {
                                        console.log("Div clicked!", subject.id);
                                        handleLinkClick(event, subject.id);
                                      }} onkey={subject.id}>{subject.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <p>Loading course details...</p>
            )}
        </div>
    );
};

export default Selectsub;