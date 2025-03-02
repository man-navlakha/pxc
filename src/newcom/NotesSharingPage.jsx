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
      setContent("");
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

  const downloadFile = async (url, fileName) => {
    try {
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
    }
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
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* PDF Display Section */}
        <div className="bg-white p-4 w-full">
          <h1 className="text-4xl text-left font-bold mb-10">📘 {course}</h1>

          {/* PDF Display */}
          {QuePdf ? (
            <div className="relative flex-wrap
 w-full flex items-center justify-between border p-6 bg-white rounded-lg shadow-lg">
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
                    <p className="font-semibold text-xl text-gray-700">
                      {QuePdf.name || "Unavailable"}
                    </p>
                    <p className="text-sm text-gray-500">PDF</p>
                  </div>
                </div>

                {/* File Size */}
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-600">Size:</p>
                  <p className="text-sm text-gray-500">{pdfSize}</p>
                </div>

                {/* Date Created */}
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-600">Date:</p>
                  <p className="text-sm text-gray-500">
                    {QuePdf.dateCreated || "unknown"}
                  </p>
                </div>

                {/* Time Created */}
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-600">Time:</p>
                  <p className="text-sm text-gray-500">
                    {QuePdf.timeCreated || "unknown"}
                  </p>
                </div>

                {/* PDF Download Button */}
                <a
                  onClick={() => downloadFile(QuePdf.pdf, "Your_File.pdf")} // Trigger the download onClick
                  className="bg-[#047857] man_off hover:bg-[#047857] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  📥 Download PDF
                </a>
              </div>
            </div>
          ) : (
            <p className="text-red-500">{error || "Loading PDF..."}</p>
          )}
        </div>

        {/* Notes List */}
        <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Shared Notes by students
          </h2>

          {ansPdfData.length === 0 ? (
            <p className="text-gray-700 text-center">
              No notes shared yet by students.
            </p>
          ) : (
            ansPdfData.map((note) => (
              <div
                key={note.id}
                className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-md flex flex-col sm:flex-row gap-4"

              >
                <div className="flex-1">
                  <img
                    src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                    alt="PDF Icon"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                {/* Note Title and Content */}
                <div className="flex-1">
                <div className="flex-1">
                  <p className="text-gray-900">{note.contant}</p>
                </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">
                    by, {note.name}
                  </h3>
                </div>


                {/* Files */}
                {note.files && note.files.length > 0 && (
                  <div className=" mt-4 sm:mt-0">
                    {note.files.map((file, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
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
                      onClick={() => downloadFile(note.pdf, "Your_File.pdf")}
                      className="inline-block bg-[#047857] hover:bg-[#065f46] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
                    >
                      📥 Download PDF
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
          {/* Add Note Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#047857] hover:bg-[#047857] text-white font-bold py-2 px-4 rounded-md mb-4"
          >
            Add Note
          </button>

          {/* Modal for Adding Notes */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                >
                  <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-4 text-center">
                  Add a Note
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="block text-gray-700 font-semibold">
                      Content:
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="4"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 font-semibold">
                      Attach Files:
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      className="w-full p-2 border border-gray-300 rounded-lg"
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
                        <div className="loader"></div> // Display loader inside the button
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <LastF />
      <Footer />
    </>
  );
};

export default NotesSharingPage;