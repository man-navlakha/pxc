import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import Lucide React icons
import '../new.css'; // Assuming new.css contains your base styles and the .mesh_2 class

const Faq = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleContent = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  const faqItems = [
    {
      id: 'works',
      question: 'How it works',
      answer: (
        <>
          <span className="font-semibold text-white">Here’s how PixelClass works for downloading study materials:</span>
          <br />
          <span className="text-blue-400 font-medium">Browse Resources:</span> Click on the{" "}
          <span className="font-semibold">"Browse all resources"</span> button.
          <br />
          <span className="text-green-400 font-medium">Select Semester:</span> Choose the semester you need (e.g.,
          Semester 4).
          <br />
          <span className="text-purple-400 font-medium">Pick a Subject:</span> Select your subject from the available
          list.
          <br />
          <span className="text-orange-400 font-medium">Choose the Resource Type:</span> Options may include{" "}
          <span className="font-semibold">Notes, Assignments, Important Questions (Imp), Past Papers, etc.</span>
          <br />
          <span className="text-red-400 font-medium">Download the File:</span> Select the file, and it will download
          directly.
        </>
      ),
    },
    {
      id: 'what-is-pixelclass',
      question: 'WHAT IS PIXELCLASS',
      answer: (
        <>
          <img
            className="w-[150px] my-4 rounded-md"
            src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png"
            alt="PixelClass Logo"
          />
          <p>A education notes sharing platform where you can share your notes and get notes of your course.</p>
        </>
      ),
    },
    {
      id: 'semesters-available',
      question: 'Which Semester available?',
      answer: <p>Now in 2025 we only have semester 3, 4 & 5 right now</p>,
    },
    {
      id: 'subjects-sem4',
      question: 'Which subject available for Semester (sem) 4?',
      answer: (
        <>
          <p>For Semester 4 of B.C.A, the available subjects are:</p>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-300">
            <li>Environmental Science (ES)</li>
            <li>Numerical Methods (NM)</li>
            <li>Statistical Skills (SS)</li>
            <li>Unified Modelling Language (UML)</li>
            <li>Introduction to Python (IP)</li>
            <li>Introduction to Operating System (IOS)</li>
            <li>Introduction to Core Java (ICJ)</li>
          </ul>
        </>
      ),
    },
    {
      id: 'student-upload',
      question: 'Can students upload files?',
      answer: (
        <>
          <p className="text-base font-semibold mb-3">
            Yes! <strong className="text-green-500">PixelClass</strong> allows students to upload their notes under the{" "}
            <strong className="text-green-500">Assignment</strong> section. Here’s how:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
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
        </>
      ),
    },
    {
      id: 'subjects-sem5',
      question: 'Which subject available for Semester (sem) 5?',
      answer: (
        <>
          <p>For Semester 5 of B.C.A, the available subjects are:</p>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-300">
            <li>Data Communication & Computer Network (DCCN)</li>
            <li>HyperText Preprocessor (PHP)</li>
            <li>Network Security (NS)</li>
            <li>Advanced Java (AJ)</li>
            <li>Linux (LIX)</li>
          </ul>
        </>
      ),
    },
    {
      id: 'how-to-signup',
      question: 'HOW TO SIGNUP',
      answer: (
        <>
          <p className="mb-2">
            Go to{" "}
            <a className="text-blue-400 hover:underline" href="/signup">
              SignUp
            </a>{" "}
            page.
          </p>
          <img
            src="https://ik.imagekit.io/pxc/Enter%20a%20new%20username.png"
            alt="Sign-up page screenshot"
            className="my-4 rounded-lg shadow-md w-full max-w-md h-auto"
          />
          <p className="mt-2">Follow these steps:</p>
          <ul className="list-disc list-inside ml-4 mt-2 text-gray-300">
            <li>Enter the required information:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Like: username, email, password</li>
              </ul>
            </li>
            <li>Click on Signup button</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="bg-black w-full min-h-screen text-white py-8 px-4 sm:px-6 lg:px-8">
      {/* FAQ Header */}
      <div className="py-10 text-center">
        <h1 className="text-xl sm:text-2xl text-gray-400 font-light tracking-wide">FREQUENTLY ASKED</h1>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">QUESTIONS</h2>
      </div>

      {/* FAQ Sections */}
      <div className="mesh_2 rounded-3xl text-left p-6 sm:p-10 mx-auto max-w-4xl border border-gray-800 shadow-lg">
        {faqItems.map((item) => (
          <div key={item.id} className="border-b border-gray-700 pb-4 mb-4 last:border-b-0 last:mb-0">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => toggleContent(item.id)}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-100 hover:text-green-400 transition-colors duration-200">
                {item.question}
              </h3>
              {openSection === item.id ? (
                <ChevronUp className="w-6 h-6 text-green-500 transition-transform duration-500" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-500 transition-transform duration-500" />
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-700 ease-in-out text-gray-300 text-sm sm:text-base ${
                openSection === item.id ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="py-2">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;