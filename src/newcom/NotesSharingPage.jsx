import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import Navbar from "../componets/Navbar";
import LastF from "../componets/LastF";
import Footer from "../componets/Footer";
import "../App.css";

const NotesSharingPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const subb = queryParams.get("sub");
  const idFromUrl = queryParams.get("id");
  const course = queryParams.get("course");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [QuePdf, setPdfData] = useState(null);
  const [pdfSize, setPdfSize] = useState(""); // State to store PDF size
  const [ansPdfData, setAnsPdfData] = useState("");
  const [error, setError] = useState("");
  const sub = queryParams.get("sub");
  const choose = queryParams.get("choose");
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };
  function getCookie(name) {
    // Create a regular expression to search for the cookie by name
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");

    // Iterate through the cookies and find the matching one
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim(); // Trim any leading spaces
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length); // Return cookie value
      }
    }

    // Return null if cookie is not found
    return null;
  }
  const handleAddNote = () => {
    if (title.trim() && content.trim()) {
      const newNote = {
        id: Date.now(),
        title,
        content,
        files,
      };
      setNotes([newNote, ...notes]);
      setTitle("");
      setContent(`${content} + ${choose}`);
      setFiles([]);
      setIsModalOpen(false);
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  useEffect(() => {
    const fetchPdfData = async () => {
      try {
        // First API call to fetch PDF data (GET request)
        const response1 = await fetch(
          "https://pixel-classes.onrender.com/api/home/QuePdf/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response1.ok) {
          throw new Error("Failed to fetch PDF data from QuePdf");
        }

        const data1 = await response1.json();
        const foundPdf = data1.find((item) => item.id === Number(idFromUrl));

        if (foundPdf) {
          setPdfData(foundPdf);
          const size = await getPdfSize(foundPdf.pdf); // Assuming you have a function to get the PDF size
          setPdfSize(size);
        } else {
          setError("No PDF found for this ID from QuePdf.");
        }

        const response2 = await fetch(
          "https://pixel-classes.onrender.com/api/home/AnsPdf/", // POST endpoint
          {
            method: "POST", // Use POST method
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: idFromUrl }), // Send ID dynamically in request body
          }
        );

        if (!response2.ok) {
          throw new Error("Failed to fetch PDF data from AnsPdf");
        }

        const data2 = await response2.json();

        if (data2 && data2.length > 0) {
          setAnsPdfData(data2); // Store all data from the second API
        } else {
          setError("No data found for this ID from AnsPdf.");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    if (idFromUrl) {
      fetchPdfData();
    }
  }, [idFromUrl]);

  const getPdfSize = async (url) => {
    try {
      const response = await fetch(url, {
        method: "GET", // Use GET if HEAD doesn't work
      });

      if (response.ok) {
        const blob = await response.blob();
        const sizeInBytes = blob.size;

        let sizeString = "";
        if (sizeInBytes < 1024 * 1024) {
          // If the size is less than 1MB, display in KB
          const sizeInKB = sizeInBytes / 1024;
          sizeString = `${sizeInKB.toFixed(2)} KB`;
        } else {
          // If the size is 1MB or larger, display in MB
          const sizeInMB = sizeInBytes / (1024 * 1024);
          sizeString = `${sizeInMB.toFixed(2)} MB`;
        }
        return sizeString;
      } else {
        console.error("Error fetching PDF:", response.statusText);
        return "Unknown";
      }
    } catch (error) {
      console.error("Error fetching PDF size:", error);
      return "Unknown";
    }
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

  const handleDownload = async (pdfUrl, fileName, setLoading) => {
    await downloadFile(pdfUrl, fileName, setLoading);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      alert("Title and content are required!");
      return;
    }

    if (files.length === 0) {
      alert("Please select at least one file!");
      return;
    }

    const name = getCookie("username");
    if (!idFromUrl) {
      alert("ID parameter is missing in the URL!");
      return;
    }

    try {
      setLoading(true); // Start loading

      const formData = new FormData();
      formData.append("name", name);
      formData.append("content", content);
      formData.append("id", idFromUrl);

      // ✅ Append the actual file (not URLs)
      files.forEach((file) => formData.append("pdf", file));

      const response = await fetch(
        "https://pixel-classes.onrender.com/api/home/upload_pdf/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Success:", data);
      alert("File uploaded successfully!");

      setIsModalOpen(false);
      setTitle("");
      setContent("");
      setFiles([]);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <>
    <div className='dark:bg-[#1E1E1E] dark:text-white h-full'>
      <Navbar />
      <div className="container mx-auto px-4 py-8 ">
        {/* PDF Display Section */}
        <div className=" p-4 w-full">
          <h1 className="text-4xl text-left font-bold mb-10">📘 {sub}</h1>
        
          {/* PDF Display */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6  dark:text-gray-100">
              Quetions
            </h2>
          {QuePdf ? (
            <div className=" relative flex-wrap flex items-center justify-between border p-6  w-full bg-white dark:bg-[#383838] rounded-lg shadow-[0px_4px_0px_0px_#065f46] mb-4 p-4 w-full ">
              {/* PDF Details Row */}
              <div className="flex flex-wrap items-center justify-between w-full space-x-4">
                {/* File Icon & File Name */}
                <div className="flex items-center space-x-4">
                  <img
                    src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                    alt="PDF Icon"
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                  <p className="font-semibold text-xl dark:text-gray-100">
                      {QuePdf.name || "Unavailable"}
                    </p>
                    <p className="text-sm text-gray-400">PDF</p>
                  </div>
                </div>

                {/* File Size */}
                <div className="flex items-center space-x-2">
                <p className="font-medium dark:text-gray-200">Size:</p>
                <p className="text-sm text-gray-400">{pdfSize}</p>
                </div>

                {/* Date Created */}
                <div className="flex items-center space-x-2">
                <p className="font-medium dark:text-gray-200">Date:</p>
                <p className="text-sm text-gray-400">
                    {QuePdf.dateCreated || "unknown"}
                  </p>
                </div>

                {/* Time Created */}
                <div className="flex items-center space-x-2">
                <p className="font-medium dark:text-gray-200">Time:</p>
                <p className="text-sm text-gray-400">
                    {QuePdf.timeCreated || "unknown"}
                  </p>
                </div>

                {/* PDF Download Button */}
                        <a
                    onClick={() => handleDownload(QuePdf.pdf, `${QuePdf.name}.pdf`, setLoading2)} // Trigger the download onClick
      className="bg-[#047857] man_off hover:bg-[#047857] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
    >
      {loading2 ? 'Loading...' : '📥 Download PDF'}
    </a>
              </div>
            </div>
          ) : (
            <p className="text-red-500">{error || "Loading PDF..."}</p>
          )}
     
 {/* Modal for Adding Notes */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="dark:bg-black border-2 dark:border-[#383838] bg-white dark:text-gray-100 p-6 rounded-lg shadow-lg w-96 relative">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-600 dark:text-gray-100 hover:text-gray-800 dark:hover:text-white "
                >
                  <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-4 text-center">
                  Add a Note
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="block text-gray-700 dark:text-gray-100 font-semibold">
                      Content:
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:text-gray-100 dark:bg-[#383838] text-gray-800 rounded-lg"
                      rows="4"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 dark:text-gray-100 font-semibold">
                      Attach Files:
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      className="w-full p-2 border border-gray-300 dark:text-gray-100 dark:bg-[#383838]  rounded-lg"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className={`bg-[#047857] hover:bg-[#065f46] text-white font-bold py-2 px-4 rounded-md ${
                        loading ? "cursor-wait" : ""
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="s-loading"></div> // Display s-loading inside the button
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        {/* Notes List */}
        <div className=" p-8 -mt-4">
       
       <div className="flex  justify-between items-center lg:flex-row flex-col">
          <h2 className="text-2xl font-bold mb-6 pt-4 text-center text-gray-800  dark:text-gray-100">
            Answer Shared Notes by students
          </h2>
       <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#047857] hover:bg-[#047857] text-white font-bold py-2 px-4 rounded-xl shadow-[0px_4px_0px_0px_#fff] mb-4"
          >
            Add Your Note
          </button>
       </div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">


          {ansPdfData.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-200 text-center">
              No notes shared yet by students.
            </p>
          ) : (
            ansPdfData.map((note) => (
              
              <div
                key={note.id}
                className="mb-6 p-6 bg-white dark:bg-[#383838] border border-gray-200 rounded-lg  flex flex-col sm:flex-row gap-4"

              >
                <div className="flex-1">
                  <img
                    src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                    alt="PDF Icon"
                    className=" lg:w-[5rem] w-12 object-contain"
                  />
                </div>
                {/* Note Title and Content */}
                <div className="flex-1">
                <div className="flex-1">
                <p className="font-semibold text-xl dark:text-gray-100 wrap-txt">{note.contant}</p>
                </div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2 dark:text-gray-200">
                    Uploded by,  {note.name}
                  </h3>
                </div>


                {/* Files */}
                {note.files && note.files.length > 0 && (
                  <div className=" mt-4 sm:mt-0">
                    {note.files.map((file, index) => (
                      <div
                        key={index}
                        className="p-3 text-md border border-gray-300 rounded-md shadow-sm"
                      >
                        <p className="text-gray-700 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Download PDF */}
                {note.pdf && (
      <div className="flex-none man_off mt-4 sm:mt-0">
        <a
          onClick={() => handleDownload(note.pdf, `Answer of ${QuePdf.name}.pdf` || "Answer pdf -- Pixel Classes.pdf", setLoading)}
          className="inline-block bg-[#047857]  text-sm hover:bg-[#065f46] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
        >
          {loading ? 'Loading...' : '📥 Download PDF'}
        </a>
      </div>
    )}
              </div>
            ))
          )}
          {/* Add Note Button */}
       
          </div>
         
        </div>
      </div>
      
</div>
      <LastF />
      <Footer />
      </div>
    </>
  );
};

export default NotesSharingPage;