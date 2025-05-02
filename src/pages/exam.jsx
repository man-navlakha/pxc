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
    // console.log(chooseParam);

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
          // console.log('Success:', data);
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
      // console.log("User not authenticated, redirecting to login...");
      event.preventDefault();
      navigate("/login");
    } else {
      const fullUrl = course;

// Remove the prefix
const sanitizedUrl = fullUrl.replace("http://localhost:5173/exam/", "");

// Navigate to the sanitized URL
window.location.href = sanitizedUrl;
      // console.log(`/ns?sub=${sub}&id=${item}&course=${course}&choose=${choose}`);
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

               <div className='flex gap-3'>
                    <a
                    onClick={(event) => handleLinkClick(event, pdf.id, sub, pdf.pdf)} 
      className="bg-[#047857] man_off hover:bg-[#047857] flex items-center text-white py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
    >📥 Download PDF
      {/* {loading2 ? 'Loading...' : '📥 Download PDF'} */}
    </a>
    {choose == 'Notes' ? 
    <a href={`https://document-to-ai.vercel.app/url?url=${pdf.pdf}`} >
<button
  class="group relative outline-0 bg-sky-200 [--sz-btn:68px] [--space:calc(var(--sz-btn)/5.5)] [--gen-sz:calc(var(--space)*2)] [--sz-text:calc(var(--sz-btn)-var(--gen-sz))] h-[var(--sz-btn)] w-[var(--sz-btn)] border border-solid border-transparent rounded-xl flex items-center justify-center aspect-square cursor-pointer transition-transform duration-200 active:scale-[0.95] bg-[linear-gradient(45deg,#efad21,#ffd60f)] [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset]"
>
  <svg
    class="animate-pulse absolute z-10 overflow-visible transition-all duration-300 text-[#ffea50] group-hover:text-white top-[calc(var(--sz-text)/7)] left-[calc(var(--sz-text)/7)] h-[var(--gen-sz)] w-[var(--gen-sz)] group-hover:h-[var(--sz-text)] group-hover:w-[var(--sz-text)] group-hover:left-[calc(var(--sz-text)/4)] group-hover:top-[calc(calc(var(--gen-sz))/2)]"
    stroke="none"
    viewBox="0 0 24 24"
    fill="currentColor"
    >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
    ></path>
  </svg>
  <span
    class="text-sm font-extrabold leading-none text-white transition-all duration-200 group-hover:opacity-0"
    >Ask AI</span
  >
</button>
    </a>
 : ''}
                </div> 
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