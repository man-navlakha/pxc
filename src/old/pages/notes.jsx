import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import GoBack from '../componets/GoBack';
import Pdf_loader from '../componets/Pdf_loader';

const Pdfs = () => {
  const [course, setCourse] = useState('');
  const [sub, setSub] = useState('');
  const [choose, setChoose] = useState('');
  const [pdfData, setPdfData] = useState([]);
  const [pdfSizes, setPdfSizes] = useState({}); // State to store PDF sizes
  const [loading, setLoading] = useState(false); // State to manage loading
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseParam = urlParams.get('course');
    const subParam = urlParams.get('sub');
    const chooseParam = urlParams.get('choose');
    
    if (courseParam) setCourse(courseParam);
    if (subParam) setSub(subParam);
    if (chooseParam) setChoose(chooseParam);
    console.log(chooseParam);

    if (courseParam && subParam) {
      setLoading(true); // Set loading to true before fetching data
      fetch('https://pixel-classes.onrender.com/api/home/QuePdf/Subject_Pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_name: courseParam, sub: subParam }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          setPdfData(data); // Update state with fetched data
          data.forEach(pdf => {
            if (pdf.pdf) {
              fetchPdfSize(pdf.pdf);
            }
          });
          setLoading(false); // Set loading to false after data is fetched
        })
        .catch((error) => {
          console.error('Error:', error);
          setLoading(false); // Set loading to false in case of error
        });
    }
  }, []);

  const fetchPdfSize = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('Content-Length');
      if (contentLength) {
        setPdfSizes(prevSizes => ({
          ...prevSizes,
          [url]: (contentLength / (1024 * 1024)).toFixed(2) + ' MB' // Convert bytes to MB
        }));
      }
    } catch (error) {
      console.error('Error fetching PDF size:', error);
    }
  };

  const getRefreshTokenFromCookies = () => {
    const refreshToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("refresh_token="))
      ?.split("=")[1];

    console.log("Refresh Token:", refreshToken);
    return refreshToken || null; // Return null if not found
  };

  const handleLinkClick = (event, item, sub, course) => {
    if (!getRefreshTokenFromCookies()) {
      console.log("User not authenticated, redirecting to login...");
      event.preventDefault();
      navigate("/login");
    } else {
      const fullUrl = course;

// Remove the prefix
const sanitizedUrl = fullUrl.replace("http://localhost:5173/exam/", "");

// Navigate to the sanitized URL
window.location.href = sanitizedUrl;
      console.log(`/ns?sub=${sub}&id=${item}&course=${course}&choose=${choose}`);
      // navigate(`/ns?sub=${sub}&id=${item}&course=${course}&choose=${choose}`);
    }
  };

  return (
    <>
      <div className='dark:bg-[#1E1E1E] dark:text-white h-screen overflow-hidden'>
        <GoBack />
        <div className="p-4 w-full">
          <h1 className="text-4xl text-left f-black font-bold">
            📘 {course}
          </h1>
          <h2 className="text-2xl pt-2 text-left f-black font-bold">
            {sub}
          </h2>
        </div>
        <div className='p-6 dark:bg-[#1E1E1E] dark:text-white h-full'>
          {loading ? (
            <Pdf_loader />
          ) : pdfData.length > 0 ? (
            pdfData
              .filter(pdf => pdf.choose === choose)
              .map((pdf, index) => (
                <div key={index} className="relative flex-wrap w-full flex items-center justify-between border p-6 bg-white dark:bg-[#383838] rounded-lg shadow-[0px_4px_0px_0px_#065f46] mb-4 p-4">
                  <div className="flex flex-wrap items-center justify-between w-full space-x-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                        alt="PDF Icon"
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <p className="font-semibold text-xl dark:text-gray-100">
                          {pdf.name || "Unavailable"}
                        </p>
                        <p className="text-sm text-gray-400">PDF</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium dark:text-gray-200">Size:</p>
                      <p className="text-sm text-gray-400">{pdfSizes[pdf.pdf] || "Unknown"}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium dark:text-gray-200">Date:</p>
                      <p className="text-sm text-gray-400">
                        {pdf.dateCreated || "unknown"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium dark:text-gray-200">Time:</p>
                      <p className="text-sm text-gray-400">
                        {pdf.timeCreated || "unknown"}
                      </p>
                    </div>

                    <a
                    onClick={(event) => handleLinkClick(event, pdf.id, sub, pdf.pdf)} 
      className="bg-[#047857] man_off hover:bg-[#047857] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
    >📥 Download PDF
      {/* {loading2 ? 'Loading...' : '📥 Download PDF'} */}
    </a>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center flex flex-col items-center justify-center text-gray-400">
              <img width="300px" src="https://ik.imagekit.io/pxc/not_eligible.svg" alt="" />
              No files available for this subject
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Pdfs;