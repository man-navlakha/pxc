import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Sem from "../componets/sem";

const Selectsub = () => {
    const location = useLocation();
    const courseName = new URLSearchParams(location.search).get('course');
    console.log(courseName);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedSem, setSelectedSem] = useState(null);
    const [semesters, setSemesters] = useState([]);

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
              onClick={() => setSelectedSem(index + 1)
               
              }
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
                                    console.log(selectedSem)
                                    console.log(selectedCourse.name)
                                    const result = response.data;
                                    console.log('API response:', result);
                                    if (result && Array.isArray(result.subjects) && result.subjects.length > 0) {
                                        console.log('Subjects:', result.subjects);
                                    } else {
                                        console.log('No subjects found for the selected semester and course.');
                                    }
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
                    {selectedSem && (
                        <div>
                            <h2>API Response</h2>
                            <pre>{JSON.stringify(selectedCourse, null, 2)}</pre>
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