import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import '../new.css';
import Footer from '../componet/Footer';
import Navbar from '../componet/Navbar';

const Semester = () => {
    const Semesters = ["3", "4", "5", "6"];
    const [selectedSem, setSelectedSem] = useState(Cookies.get("latest_sem") || null);
    const sectionRef = useRef(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Effect to fetch subjects when the component mounts or selectedSem changes
    useEffect(() => {
        const fetchSubjects = async () => {
            if (selectedSem) { // Only fetch if a semester is selected
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.post('https://pixel-classes.onrender.com/api/home/QuePdf/Get_Subjact', {
                        sem: selectedSem, // Use the current selectedSem state
                        course_name: "B.C.A",
                    });
                    const result = response.data;
                    setApiResponse(result);
                    console.log('API Response:', result);
                } catch (err) {
                    console.error('Error fetching subjects:', err);
                    setError('Failed to load subjects. Please try again.');
                    setApiResponse(null);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchSubjects(); // Call the async function

        // Scroll to the section after API response is available (handled by the other useEffect)
        // This useEffect is solely for fetching data on selectedSem change/initial load
    }, [selectedSem]); // Dependency array: re-run when selectedSem changes

    // Effect to scroll to the section when API response is available
    useEffect(() => {
        if (apiResponse && sectionRef.current) {
            scrollToSection();
        }
    }, [apiResponse]); // Dependency array: re-run when apiResponse changes

    const scrollToSection = () => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSemClick = (sem) => {
        setSelectedSem(sem); // This will trigger the useEffect to fetch data
        Cookies.set("latest_sem", sem); // Update the cookie
    };

    return (
        <>
            <div className="bg-pattern"></div>
            <div className='mesh_sem Mont h-max'>
                <Navbar />
                <div className='mont'>
                    <div className='p-4 py-16 flex flex-col text-center content-center flex-nowrap justify-center gap-3 items-center'>
                        <div>
                            <span className='text-center m-3 text-3xl md:text-lg lg:text-3xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent Mont '>Ready to Conquer Your BCA Semester?</span>
                        </div>
                        <div>
                            <span className='text-center text-md my-3 text-gray-300 font-medium'>Tap your Semester to unlock all essential study materials. 🚀</span>
                        </div>
                    </div>
                </div>
                <div className='mesh_sem2 h-full p-5'>
                    <div className='grid gap-4 text-white items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-flow-cols'>
                        {Semesters.map((sem, index) => (
                            <div className="relative" key={index}>
                                <div
                                    className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-pink-600 via-green-600 to-pink-600 opacity-50 blur-2xl"
                                ></div>
                                <div className="relative flex w-full items-center justify-center border border-zinc-700 rounded-2xl bg-zinc-900 text-slate-300">
                                    <div
                                        onClick={() => handleSemClick(sem)}
                                        className={`flex-1 flex max-w-[100vw] py-6 flex-col overflow-hidden rounded-2xl bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 lg:min-w-[384px] cursor-pointer ${selectedSem === sem ? 'border-2 border-green-500' : ''}`}
                                    >
                                        <div className='text-xl font-bold flex items-center justify-center'>
                                            <span className="mr-1">Semester {sem}</span> {/* Added "Semester" prefix for display */}
                                            <span className={` ${Cookies.get("latest_sem") === sem ? 'visible' : 'hidden'} border-green-600 text-green-600 bg-green-900/50 border rounded mr-1 p-1 text-xs`}>Last time Used</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={` ${selectedSem ? 'visible mt-10 h-full' : 'hidden'} text-3xl lg:text-5xl text-white`}>
                        <div>
                            {selectedSem && ( // Only show the title if a semester is selected
                                <span ref={sectionRef} className="font-bold">Choose your subject for Semester {selectedSem}</span>
                            )}
                            {loading && <p className="text-xl mt-4">Loading subjects...</p>}
                            {error && <p className="text-xl mt-4 text-red-500">{error}</p>}
                            {apiResponse && (
                                <div className="mt-4 text-xl">

                                    {apiResponse && apiResponse.length > 0 ? (
                                        <div className="grid gap-5 grid-cols-3 mx-8">
                                            {apiResponse.map((subject) => (
                                                <div className="" key={subject.id}>
 <div class="book">
    <p>Hello</p>
    <div className=" p-2 cover">
        <p>{subject.name}</p>
    </div>
   </div></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No subjects found for this semester.</p>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Semester;