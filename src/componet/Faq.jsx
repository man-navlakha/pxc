import React, { useState } from 'react';
import '../new.css'

const Faq = () => {

    const [openSection, setOpenSection] = useState(null);

    const toggleContent = (id) => {
        setOpenSection(openSection === id ? null : id);
    };

    return (

        <div className="bg-black h-max min-h-screen text-white py-3">
            {/* <div className="flex justify-center space-x-4 mb-10">
        <button className="border border-white px-4 py-2">SHIPPING + RETURNS</button>
        <button className="border border-white px-4 py-2">PRODUCT</button>
        <button className="border border-white px-4 py-2 bg-white text-black">PAYMENTS</button>
        <button className="border border-white px-4 py-2">MISCELLANEOUS</button>
        </div> */}
        <div className=" py-10">
            <h1 className="text-2xl">FREQUENTLY ASKED</h1>
            <h2 className="text-4xl">QUESTIONS</h2>
        </div>
            <div className="mesh_2 rounded-3xl text-left p-10">

                <div className="border-b border-pink-500 pb-4 mb-4">
                    <div
                        className="flex justify-between cursor-pointer"
                        onClick={() => toggleContent('works')}
                    >
                        <h3 className="text-lg font-black">How it works</h3>
                        <i
                            id="icon-payment-methods"
                            className={`fas ${openSection === 'works' ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}`}
                        ></i>
                    </div>
                    <p id="content-payment-methods" className={`mt-2 ${openSection === 'works' ? '' : 'hidden'}`}>
                    <span className="font-semibold">Here’s how Pixel Class works for downloading study materials:</span>
    <br />
    <span className="text-blue-600 font-medium">Browse Resources:</span> Click on the <span className="font-semibold">"Browse all resources"</span> button.
    <br />
    <span className="text-green-600 font-medium">Select Semester:</span> Choose the semester you need (e.g., Semester 4).
    <br />
    <span className="text-purple-600 font-medium">Pick a Subject:</span> Select your subject from the available list.
    <br />
    <span className="text-orange-600 font-medium">Choose the Resource Type:</span> Options may include <span className="font-semibold">Notes, Assignments, Important Questions (Imp), Past Papers, etc.</span>
    <br />
    <span className="text-red-600 font-medium">Download the File:</span> Select the file, and it will download directly.
    <br />
                    </p>
                </div>
                <div className="border-b border-pink-500 pb-4 mb-4">
                    <div
                        className="flex justify-between cursor-pointer"
                        onClick={() => toggleContent('payment-methods')}
                    >
                        <h3 className="text-lg font-black">WHAT IS PIXEL CLASS</h3>
                        <i
                            id="icon-payment-methods"
                            className={`fas ${openSection === 'payment-methods' ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}`}
                        ></i>
                    </div>
                    <p id="content-payment-methods" className={`mt-2 ${openSection === 'payment-methods' ? '' : 'hidden'}`}>
                        <img className='w-[200px]' src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="" />
                        A education notes sharing platform there you can share your notes and get notes of your course.
                    </p>
                </div>


                <div className="border-b border-pink-500 pb-4 mb-4">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleContent('sem')}
                    >
                        <h3 className="text-lg font-black">Which Semester available?</h3>
                        <i
                            id="icon-payment-methods"
                            className={`fas ${openSection === 'sem' ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}`}
                        ></i>
                    </div>
                    <p id="content-payment-methods" className={`mt-2 ${openSection === 'sem' ? '' : 'hidden'}`}>
                        Now in 2025 we only have semester 3, 4 & 5 right now
                    </p>
                </div>



                <div className="border-b border-pink-500 pb-4 mb-4">
                    <div
                        className="flex justify-between  cursor-pointer"
                        onClick={() => toggleContent('four')}
                    >
                        <h3 className="text-lg font-black">which subject available for Semester(sem) 4?</h3>
                        <i
                            id="icon-payment-methods"
                            className={`fas ${openSection === 'four' ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}`}
                        ></i>
                    </div>
                    <p id="content-payment-methods" className={`mt-2 ${openSection === 'four' ? '' : 'hidden'}`}>
                        For Semester 4 of B.C.A, the available subjects are:
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Environmental Science (ES)</li>
                            <li>Numerical Methods (NM)</li>
                            <li>Statistical Skills (SS)</li>
                            <li>Unified Modelling Language (UML)</li>
                            <li>Introduction to Python (IP)</li>
                            <li>Introduction to Operating System (IOS)</li>
                            <li>Introduction to Core Java (ICJ)</li>
                        </ul>

                    </p>
                </div>



                <div className="border-b border-pink-500 pb-4 mb-4">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleContent('isstu')}
                    >
                        <h3 className="text-lg font-black">Is this student can upload files?</h3>
                        <i
                            id="icon-payment-methods"
                            className={`fas ${openSection === 'isstu' ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}`}
                        ></i>
                    </div>
                    <p id="content-payment-methods" className={`mt-2 ${openSection === 'isstu' ? '' : 'hidden'}`}>
                        <div className="">
                            <p className="text-lg font-semibold mb-4">Yes! <strong className='text-green-500'>Pixel Class</strong> allows students to upload their notes under the <strong className='text-green-500'>Assignment</strong> section. Here’s how:</p>

                            <ol className="list-decimal list-inside space-y-3">
                                <li><strong>Go to the Assignment Page:</strong> Select your subject.</li>
                                <li><strong>Click on "Add Your Note":</strong> This will open a popup.</li>
                                <li><strong>Attach Your File:</strong> Upload the document you want to share.</li>
                                <li><strong>Enter Your Name:</strong> Fill in your name in the provided field.</li>
                                <li><strong>Submit:</strong> Click the submit button.</li>
                                <li><strong>Visibility:</strong> Within a minute, all students can view and download your notes.</li>
                            </ol>
                        </div>
                    </p>
                </div>


                <div className="border-b border-pink-500 pb-4 mb-4">
                    <div
                        className="flex justify-between  cursor-pointer"
                        onClick={() => toggleContent('five-sem')}
                    >
                        <h3 className="text-lg font-black">which subject available for Semester(sem) 5?</h3>
                        <i
                            id="icon-payment-methods"
                            className={`fas ${openSection === 'five-sem' ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}`}
                        ></i>
                    </div>
                    <p id="content-payment-methods" className={`mt-2 ${openSection === 'five-sem' ? '' : 'hidden'}`}>
                        For Semester 5 of B.C.A, the available subjects are:
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Environmental Science (ES)</li>
                            <li>Numerical Methods (NM)</li>
                            <li>Statistical Skills (SS)</li>
                            <li>Unified Modelling Language (UML)</li>
                            <li>Introduction to Python (IP)</li>
                            <li>Introduction to Operating System (IOS)</li>
                            <li>Introduction to Core Java (ICJ)</li>
                        </ul>
                    </p>
                </div>



                <div className="border-b border-gray-300 pb-4 mb-4">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleContent('refund-time')}
                    >
                        <h3 className="text-lg font-black">HOW TO SIGNUP</h3>
                        <i
                            id="icon-refund-time"
                            className={`fas ${openSection === 'refund-time' ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}`}
                        ></i>
                    </div>
                    <p id="content-refund-time" className={`mt-2 ${openSection === 'refund-time' ? '' : 'hidden'}`}>
                        <ul>
                            <li>Go to <a className='text-blue-800' href="/signup">Sign Up</a> page.</li>
                            <img src="https://ik.imagekit.io/pxc/Enter%20a%20new%20username.png" alt="Sing-up page" srcSet="" />
                            <li><br /></li>
                            <li>Follow this steps
                                <ul>
                                    <li>Enter the required information
                                        <ul>
                                            <li>Like : username , email, password</li>
                                        </ul>
                                    </li>
                                    <li>Click on Signup button</li>
                                </ul>
                            </li>
                        </ul>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Faq
