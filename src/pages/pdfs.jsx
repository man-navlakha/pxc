import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import GoBack from '../componets/GoBack';
import Pdf_loader from '../componets/Pdf_loader';

const Pdfs = () => {
  const [course, setCourse] = useState('');
  const [sub, setSub] = useState('');
  const sub_new = useState('');
  const [pdfData, setPdfData] = useState([]);
  const [pdfSizes, setPdfSizes] = useState({}); // State to store PDF sizes
  const [loading, setLoading] = useState(false); // State to manage loading
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseParam = urlParams.get('course');
    const subParam = urlParams.get('sub');

    if (courseParam) setCourse(courseParam);
    if (subParam) setSub(subParam);

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

  const getAccessTokenFromCookies = () => {
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    console.log("Access Token:", accessToken);
    return accessToken || null; // Return null if not found
  };

  const handleLinkClick = (event, item, sub, course) => {
    if (!getAccessTokenFromCookies()) {
      console.log("User not authenticated, redirecting to login...");
      event.preventDefault();
      navigate("/login");
    } else {
      console.log(`/ns?sub=${sub}&id=${item}&course=${course}`);
      navigate(`/ns?sub=${sub}&id=${item}&course=${course}`);
    }
  };

  return (
    <>
      <div className='dark:bg-[#1E1E1E] dark:text-white bg-white h-screen'>
        <GoBack />
        <div className="p-4 w-full">
          <h1 className="text-4xl text-left f-black font-bold">
            📘 {course}
          </h1>
          <h2 className="text-2xl pt-2 text-left f-black font-bold">
            {sub}
          </h2>
        </div>
        <div className='p-6 dark:bg-[#1E1E1E] dark:text-white bg-white h-full'>
          {loading ? (
            <Pdf_loader />
          ) : pdfData.length > 0 ? (
            pdfData.map((pdf, index) => (
              <div key={index} className="relative flex-wrap w-full flex items-center justify-between border p-6 bg-white dark:bg-[#383838] rounded-lg shadow-[0px_4px_0px_0px_#065f46] mb-4 p-4">
                <div className="flex flex-wrap items-center justify-between w-full space-x-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                      alt="PDF Icon"
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <p className="font-semibold text-xl text-gray-100">
                        {pdf.name || "Unavailable"}
                      </p>
                      <p className="text-sm text-gray-400">PDF</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-200">Size:</p>
                    <p className="text-sm text-gray-400">{pdfSizes[pdf.pdf] || "Unknown"}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-200">Date:</p>
                    <p className="text-sm text-gray-400">
                      {pdf.dateCreated || "unknown"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-200">Time:</p>
                    <p className="text-sm text-gray-400">
                      {pdf.timeCreated || "unknown"}
                    </p>
                  </div>
                  <a
                    onClick={(event) => handleLinkClick(event, pdf.id, sub, course)}
                    className="bg-[#047857] hover:bg-[#065f46] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    📥 Open this assignment
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">
              No files available
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Pdfs;