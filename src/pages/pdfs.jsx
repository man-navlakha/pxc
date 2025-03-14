import React, { useEffect, useState } from 'react';
import { X } from "lucide-react";

const Pdfs = () => {
  const [course, setCourse] = useState('');
  const [sub, setSub] = useState('');
  const [pdfData, setPdfData] = useState([]);
  const [pdfSizes, setPdfSizes] = useState({}); // State to store PDF sizes
  const [loading, setLoading] = useState(false); // State to manage loading

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseParam = urlParams.get('course');
    const subParam = urlParams.get('sub');

    if (courseParam) setCourse(courseParam);
    if (subParam) setSub(subParam);

    if (courseParam && subParam) {
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
      })
      .catch((error) => {
        console.error('Error:', error);
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

  const handleDownload = async (pdfUrl, fileName) => {
    await downloadFile(pdfUrl, fileName, setLoading);
  };

  const downloadFile = async (url, fileName, setLoading) => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob(); // Convert the response to a blob
      const blobUrl = URL.createObjectURL(blob); // Create a blob URL

      // Create an anchor element to trigger the download
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName; // Set the desired file name
      a.click(); // Programmatically click the anchor to trigger the download

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Course: {course}</h1>
      <h2>Subject: {sub}</h2>
      {loading && <p>Downloading...</p>}
      {pdfData.length > 0 ? (
        pdfData.map((pdf, index) => (
          <div key={index} className="relative flex-wrap w-full flex items-center justify-between border p-6 bg-white rounded-lg shadow-[0px_4px_0px_0px_#065f46] mb-4">
            <div className="flex flex-wrap items-center justify-between w-full space-x-4">
              <div className="flex items-center space-x-4">
                <img
                  src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                  alt="PDF Icon"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <p className="font-semibold text-xl text-gray-700">
                    {pdf.name || "Unavailable"}
                  </p>
                  <p className="text-sm text-gray-500">PDF</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-600">Size:</p>
                <p className="text-sm text-gray-500">{pdfSizes[pdf.pdf] || "Unknown"}</p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-600">Date:</p>
                <p className="text-sm text-gray-500">
                  {pdf.dateCreated || "unknown"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-600">Time:</p>
                <p className="text-sm text-gray-500">
                  {pdf.timeCreated || "unknown"}
                </p>
              </div>
              <a
                onClick={() => handleDownload(pdf.pdf, `${pdf.name}.pdf`)}
                className="bg-[#047857] hover:bg-[#065f46] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                📥 Download PDF
              </a>
            </div>
          </div>
        ))
      ) : (
        <p className="text-red-500">Loading PDF...</p>
      )}
    </div>
  );
};

export default Pdfs;