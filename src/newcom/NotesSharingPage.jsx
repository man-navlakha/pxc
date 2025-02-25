import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import Navbar from "../componets/Navbar";
import LastF from "../componets/LastF";
import Footer from "../componets/Footer";

const NotesSharingPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subb = queryParams.get("sub");
  const idFromUrl = queryParams.get("id");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [QuePdf, setPdfData] = useState(null);
  const [pdfSize, setPdfSize] = useState(""); // State to store PDF size
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

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

  // Fetch PDF data by ID
  useEffect(() => {
    const fetchPdfData = async () => {
      try {
        const response = await fetch(
          "https://pixel-classes.onrender.com/api/home/QuePdf/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch PDF data");
        }

        const data = await response.json();
        const foundPdf = data.find((item) => item.id === Number(idFromUrl));

        if (foundPdf) {
          setPdfData(foundPdf);
          const size = await getPdfSize(foundPdf.pdf); // Use foundPdf.pdf directly here
          setPdfSize(size); // Set the PDF size once fetched
        } else {
          setError("No PDF found for this ID.");
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
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* PDF Display Section */}
        <div className="mb-6 p-6 bg-white">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            📘 Data Structure Queue PDF
          </h2>

          {/* PDF Display */}
          {QuePdf ? (
            <div className="relative w-full flex items-center justify-between border p-6 bg-white rounded-lg shadow-lg">
              {/* PDF Details Row */}
              <div className="flex items-center justify-between w-full space-x-4">
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
                  onClick={() =>
                    downloadFile(QuePdf.pdf, "downloaded_file.pdf")
                  } // Trigger the download onClick
                  className="bg-[#047857] hover:bg-[#047857] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
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
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Shared Notes for {subb}</h2>
          {notes.length === 0 ? (
            <p className="text-gray-700 text-center">
              No notes shared yet for {subb}.
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="mb-4 p-4 bg-white border rounded-lg shadow-md"
              >
                <h3 className="text-xl font-bold">{note.title}</h3>
                <p className="text-gray-700">{note.content}</p>
                {note.files.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {note.files.map((file, index) => (
                      <div
                        key={index}
                        className="p-2 border bg-gray-50 rounded-md"
                      >
                        <p className="text-gray-700 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md"
                >
                  Delete
                </button>
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
            <form action="https://pixel-classes.onrender.com/api/home/upload_pdf/" method="post">
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
                <div className="mb-3">
                  <label className="block text-gray-700 font-semibold">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 font-semibold">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="4"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 font-semibold">
                    Attach Files
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
                   
                    className="bg-[#047857] hover:bg-[#047857] text-white font-bold py-2 px-4 rounded-md mb-4"
                  >
                    Add File
                  </button>
                </div>
              </div>
            </div></form>
          )}
        </div>
      </div>
      <LastF />
      <Footer />
    </>
  );
};

export default NotesSharingPage;