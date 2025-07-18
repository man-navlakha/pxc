import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sem from "../componets/sem";
import GoBack from "../componets/GoBack";
import "./style/sub.css";
import Sub_card from "../componets/Sub_card";
import Sub_loader from "../componets/Sub_loader"


const Sub = () => {
    const location = useLocation();
    const courseName = new URLSearchParams(location.search).get('course');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedSem, setSelectedSem] = useState(1);
    const [semesters, setSemesters] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {

        const fetchCourseDetails = async () => {
            try {
                const response = await axios.get('https://pixel-classes.onrender.com/api/home/courses');
                const data = response.data;

                if (data.CourseList && Array.isArray(data.CourseList)) {
                    const course = data.CourseList.find(course => course.name === courseName);
                    if (course) {
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
        return accessToken || null; // Return null if not found
    };
    const handleLinkClick = (event, item) => {
        navigate(`/old/choose?course=${selectedCourse.name}&sub=${item}`);
    };

    return (
        <div className=" bg-white dark:bg-[#1E1E1E] dark:text-white h-screen overflow-y-scroll">
            <GoBack />
            <div className=" p-4 w-full">
                <h1 className="text-4xl text-left f-black font-bold">
                    📘 {courseName}
                </h1>
            </div>
            <p className="mt-4 text-left pl-3 p-4 text-2xl">Select Semester</p>

            {/* Semester Tabs */}
            <div className="z-1 rounded-t-lg -m-sm ">
                <div className="block bg-[#fff] dark:bg-[#383838] h-screen shadow-[inset_0px_4px_4px_rgba(0,0,0)] overflow-hidden overflow-y-scroll rounded-t-3xl mb-10">

                    {/* <h1>Select Semester</h1> */}
                    {selectedCourse ? (
                        <>
                            <div className="p-4 -z-2 mr-2 rounded-t-lg flex overflow-x-auto gap-6 w-full min-h-[50px] whitespace-nowrap">
                                {/* <p>Course: {selectedCourse.name}</p> */}
                                <div className="flex gap-4">
                                    {selectedCourse?.number_sem > 0 ? (
                                        Array.from({ length: selectedCourse.number_sem }, (_, index) => (
                                            <button
                                                className={`px-4 py-2 transition-all ${selectedSem === index + 1
                                                        ? "border-2 border-black dark:border-white rounded-lg shadow-md"
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
                                        <p className="fj-black text-red-500 p-4 text-2xl mb-6">No semesters available</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">

                                {selectedSem && apiResponse && (
                                    <div className="flex flex-col ">
                                        {/* <pre>{JSON.stringify(apiResponse, null, 2)}</pre> */}
                                        <p className="fj-black text-gray-800 p-4 text-2xl mb-6 dark:text-white ">Choose your Subject</p>
                                        <ul className="grid lg:grid-cols-2 pb-4 gap-2 items-baseline pl-4 pr-6 mb-20">
                                            {apiResponse.length > 0 ? (
                                                <>
                                                    {apiResponse.map((subject) => (
                                                        <Sub_card
                                                            key={subject.name}
                                                            subject={subject}
                                                            onClick={(event) => {
                                                                handleLinkClick(event, subject.name);
                                                            }}
                                                        />
                                                    ))}
                                                </>
                                            ) : (
                                                <p className="fj-black text-red-500 p-4 text-2xl mb-6">No subjects available</p>
                                            )}
                                        </ul>
                                    </div>
                                )}

                            </div>
                        </>
                    ) : (
                        // <p className="cursor-wait p-10 font-bold text-xl text-gray-700 ">Loading course details...</p>
                        <div className="p-4">

                            <Sub_loader />
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default Sub;