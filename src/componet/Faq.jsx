import React, { useState } from 'react';
import '../new.css'; // Assuming new.css contains your base styles and any custom Tailwind CSS

const Faq = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleContent = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="bg-black w-full min-w-full h-max min-h-screen text-white py-3">
      {/* FAQ Header */}
      <div className="py-10 text-center">
        <h1 className="text-2xl">FREQUENTLY ASKED</h1>
        <h2 className="text-4xl">QUESTIONS</h2>
      </div>

      {/* FAQ Sections */}
      <div className="mesh_2 rounded-3xl text-left p-10 mx-6">
        {/* How it works */}
        <div className="border-b border-pink-500 pb-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleContent('works')}
          >
            <h3 className="text-lg font-black">How it works</h3>
            <i
              className={`transition-transform duration-500 ease-in-out fas ${
                openSection === 'works'
                  ? 'fa-chevron-up text-pink-500 rotate-180'
                  : 'fa-chevron-down text-gray-500'
              }`}
            ></i>
          </div>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              openSection === 'works' ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">Here’s how PixelClass works for downloading study materials:</span>
              <br />
              <span className="text-blue-400 font-medium">Browse Resources:</span> Click on the{' '}
              <span className="font-semibold">"Browse all resources"</span> button.
              <br />
              <span className="text-green-400 font-medium">Select Semester:</span> Choose the semester you need (e.g.,
              Semester 4).
              <br />
              <span className="text-purple-400 font-medium">Pick a Subject:</span> Select your subject from the available
              list.
              <br />
              <span className="text-orange-400 font-medium">Choose the Resource Type:</span> Options may include{' '}
              <span className="font-semibold">Notes, Assignments, Important Questions (Imp), Past Papers, etc.</span>
              <br />
              <span className="text-red-400 font-medium">Download the File:</span> Select the file, and it will download
              directly.
            </p>
          </div>
        </div>

        {/* What is PixelClass */}
        <div className="border-b border-pink-500 pb-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleContent('payment-methods')}
          >
            <h3 className="text-lg font-black">WHAT IS PIXELCLASS</h3>
            <i
              className={`transition-transform duration-500 ease-in-out fas ${
                openSection === 'payment-methods'
                  ? 'fa-chevron-up text-pink-500 rotate-180'
                  : 'fa-chevron-down text-gray-500'
              }`}
            ></i>
          </div>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              openSection === 'payment-methods' ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <img
              className="w-[200px] my-2"
              src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png"
              alt="PixelClass Logo"
            />
            <p>A education notes sharing platform where you can share your notes and get notes of your course.</p>
          </div>
        </div>

        {/* Which Semester available? */}
        <div className="border-b border-pink-500 pb-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleContent('sem')}
          >
            <h3 className="text-lg font-black">Which Semester available?</h3>
            <i
              className={`transition-transform duration-500 ease-in-out fas ${
                openSection === 'sem'
                  ? 'fa-chevron-up text-pink-500 rotate-180'
                  : 'fa-chevron-down text-gray-500'
              }`}
            ></i>
          </div>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              openSection === 'sem' ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <p>Now in 2025 we only have semester 3, 4 & 5 right now</p>
          </div>
        </div>

        {/* Which subject available for Semester (sem) 4? */}
        <div className="border-b border-pink-500 pb-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleContent('four')}
          >
            <h3 className="text-lg font-black">Which subject available for Semester (sem) 4?</h3>
            <i
              className={`transition-transform duration-500 ease-in-out fas ${
                openSection === 'four'
                  ? 'fa-chevron-up text-pink-500 rotate-180'
                  : 'fa-chevron-down text-gray-500'
              }`}
            ></i>
          </div>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              openSection === 'four' ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <p>For Semester 4 of B.C.A, the available subjects are:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Environmental Science (ES)</li>
              <li>Numerical Methods (NM)</li>
              <li>Statistical Skills (SS)</li>
              <li>Unified Modelling Language (UML)</li>
              <li>Introduction to Python (IP)</li>
              <li>Introduction to Operating System (IOS)</li>
              <li>Introduction to Core Java (ICJ)</li>
            </ul>
          </div>
        </div>

        {/* Is this student can upload files? */}
        <div className="border-b border-pink-500 pb-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleContent('isstu')}
          >
            <h3 className="text-lg font-black">Is this student can upload files?</h3>
            <i
              className={`transition-transform duration-500 ease-in-out fas ${
                openSection === 'isstu'
                  ? 'fa-chevron-up text-pink-500 rotate-180'
                  : 'fa-chevron-down text-gray-500'
              }`}
            ></i>
          </div>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              openSection === 'isstu' ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="">
              <p className="text-lg font-semibold mb-4">
                Yes! <strong className="text-green-500">PixelClass</strong> allows students to upload their notes under the{' '}
                <strong className="text-green-500">Assignment</strong> section. Here’s how:
              </p>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>Go to the Assignment Page:</strong> Select your subject.
                </li>
                <li>
                  <strong>Click on "Add Your Note":</strong> This will open a popup.
                </li>
                <li>
                  <strong>Attach Your File:</strong> Upload the document you want to share.
                </li>
                <li>
                  <strong>Enter Your Name:</strong> Fill in your name in the provided field.
                </li>
                <li>
                  <strong>Submit:</strong> Click the submit button.
                </li>
                <li>
                  <strong>Visibility:</strong> Within a minute, all students can view and download your notes.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Which subject available for Semester (sem) 5? */}
        <div className="border-b border-pink-500 pb-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleContent('five-sem')}
          >
            <h3 className="text-lg font-black">Which subject available for Semester (sem) 5?</h3>
            <i
              className={`transition-transform duration-500 ease-in-out fas ${
                openSection === 'five-sem'
                  ? 'fa-chevron-up text-pink-500 rotate-180'
                  : 'fa-chevron-down text-gray-500'
              }`}
            ></i>
          </div>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              openSection === 'five-sem' ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <p>For Semester 5 of B.C.A, the available subjects are:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Data Communication & Computer Network (DCCN)</li>
              <li>HyperText Preprocessor (PHP)</li>
              <li>Network Security (NS)</li>
              <li>Advanced Java (AJ)</li>
              <li>Linux (LIX)</li>
            </ul>
          </div>
        </div>

        {/* HOW TO SIGNUP */}
        <div className="border-b border-pink-500 pb-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleContent('refund-time')}
          >
            <h3 className="text-lg font-black">HOW TO SIGNUP</h3>
            <i
              className={`transition-transform duration-500 ease-in-out fas ${
                openSection === 'refund-time'
                  ? 'fa-chevron-up text-pink-500 rotate-180'
                  : 'fa-chevron-down text-gray-500'
              }`}
            ></i>
          </div>
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              openSection === 'refund-time' ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <ul>
              <li>
                Go to <a className="text-blue-400 hover:underline" href="/signup">SignUp</a> page.
              </li>
              <img
                src="https://ik.imagekit.io/pxc/Enter%20a%20new%20username.png"
                alt="Sign-up page screenshot"
                className="my-4 rounded-md shadow-lg"
              />
              <li>
                Follow these steps:
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Enter the required information:
                    <ul className="list-circle list-inside ml-4">
                      <li>Like: username, email, password</li>
                    </ul>
                  </li>
                  <li>Click on Signup button</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;