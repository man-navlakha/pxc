import React, { useEffect, useState } from 'react';
import '../../new.css';
import Cookies from "js-cookie";
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';
import SharePopup from '../../componet/SharePopup';
import { useNavigate, useParams } from 'react-router-dom';

const Ns = () => {
    const sem = Cookies.get("latest_sem");
    const Sub = Cookies.get("sub");
    const option = Cookies.get("choose");
    const idFromUrl = Cookies.get("pdfid");
    const sub = Cookies.get("sub");
    const { osubject, ochoose } = useParams();
    const [shareModal, setShareModal] = useState({ isOpen: false, pdf: null });
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isopen, setIsopen] = useState(false);
    const [downloadStates, setDownloadStates] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [pdfData, setPdfData] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});
    const [content, setContent] = useState("");
    const [shareMessage, setShareMessage] = useState("Hey, check this PDF: http://localhost:5173/chat?");
    const [files, setFiles] = useState([]);
    const navigate = useNavigate();


    const Subject = (osubject || Sub)
    const choose = (ochoose || option)


    console.log(Subject)
    console.log(choose)

    // https://pixelclass.netlify.app/ns?sub=Linux&id=107&course=B.C.A&choose=imp


    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sub = params.get('sub');
        const id = params.get('id');
        const course = params.get('course');
        const choose = params.get('choose'); // ⬅️ this `choose`, not from state

        if (["Assignment", "imp"].includes(choose)) {
            Cookies.set("sub", sub);
            Cookies.set("choose", choose);
            Cookies.set("pdfid", id);
            Cookies.set("from", "email");
            navigate(`/select?sub=${sub}&id=${id}&course=${course}&choose=${choose}`);
            return;
        }

        // Save cookies
        if (sub) Cookies.set("sub", sub);
        if (id) Cookies.set("pdfid", id);
        if (course) Cookies.set("course", course);
        if (choose) Cookies.set("choose", choose);

        setLoading(false);
    }, []);

     const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
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

        const name = Cookies.get("username");


        try {
            setLoading(true); // Start loading

            const formData = new FormData();
            formData.append("name", content);
            formData.append("course_id", 1);
            formData.append("sem", sem);
            formData.append("choose", choose);
            formData.append("sub", sub);
            // Check if all selected files are PDFs
            const nonPdfFiles = files.filter(file => file.type !== "application/pdf");
            if (nonPdfFiles.length > 0) {
                alert("Only PDF files are allowed!");
                setLoading(false);
                return;
            }

            // ✅ Append the actual file (not URLs)
            files.forEach((file) => formData.append("pdf", file));

            const response = await fetch(
                "https://pixel-classes.onrender.com/api/home/QuePdf/Add/",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            alert("File uploaded successfully!");
            setContent("");
            setFiles([]);
            setIsopen(false);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to upload file. Please try again.");
        } finally {
            setLoading(false); // End loading
            setIsopen(false);
        }

    }


    useEffect(() => {
        if (Subject) {
            setLoading(true); // Set loading to true before fetching data
            fetch('https://pixel-classes.onrender.com/api/home/QuePdf/Subject_Pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ course_name: "B.C.A", sub: Subject }),
            })
                .then(response => response.json())
                .then(data => {
                    setPdfData(data);
                    data.forEach(pdf => {
                        if (pdf.pdf) {
                            fetchPdfSize(pdf.pdf);
                        }
                    });
                    setLoading(false);
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
                    [url]: (contentLength / 1024).toFixed(2) + ' KB' // Convert bytes to KB
                }));
            }

        } catch (error) {
            console.error('Error fetching PDF size:', error);
        }
    };



    const handleDownload = async (pdfUrl, pdfName, pdfId) => {
        // Helper function to get download history from Local Storage
        const getDownloadHistory = () => {
            try {
                const historyString = localStorage.getItem('downloadHistory');
                return historyString ? JSON.parse(historyString) : [];
            } catch (error) {
                console.error("Error parsing download history from Local Storage:", error);
                return [];
            }
        };

        // Helper function to save download history to Local Storage
        const saveDownloadHistory = (history) => {
            try {
                // Optional: Limit the number of items to prevent Local Storage from growing too large
                const MAX_HISTORY_ITEMS = 50; // Adjust this number as needed
                if (history.length > MAX_HISTORY_ITEMS) {
                    history = history.slice(0, MAX_HISTORY_ITEMS); // Keep only the most recent items
                }
                localStorage.setItem('downloadHistory', JSON.stringify(history));
            } catch (error) {
                console.error("Error saving download history to Local Storage:", error);
            }
        };

        setLoadingStates(prevStates => ({ ...prevStates, [pdfId]: true }));
        setDownloadStates(prevStates => ({ ...prevStates, [pdfId]: 'downloading' }));

        try {
            const response = await fetch(pdfUrl);
            const arrayBuffer = await response.arrayBuffer(); // Get as ArrayBuffer

            // Create a Blob with a generic MIME type to encourage download
            const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

            const anchor = document.createElement("a");
            anchor.href = URL.createObjectURL(blob);
            anchor.download = `${pdfName}.pdf` || "download.pdf"; // Ensure a .pdf extension
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

            // Clean up the object URL
            URL.revokeObjectURL(anchor.href);

            setDownloadStates(prevStates => ({ ...prevStates, [pdfId]: 'download_done' }));

            // --- Store download details in Local Storage ---
            const history = getDownloadHistory();
            const newDownload = {
                pdfName: pdfName,
                pdfUrl: pdfUrl,
                downloadDate: new Date().toISOString() // Store date and time in ISO format
            };
            history.unshift(newDownload); // Add new item to the beginning (most recent first)
            saveDownloadHistory(history);
            // --- End Local Storage logic ---

        } catch (error) {
            console.error("Download failed:", error);
            setDownloadStates(prevStates => ({ ...prevStates, [pdfId]: 'error' }));
        } finally {
            setLoadingStates(prevStates => ({ ...prevStates, [pdfId]: false }));
        }
    };


    // Generates app-specific or https link depending on deep linking
    const getShareLink = (pdf) => {
        const basePath = window.location.origin; // adjust if deep linking
        return `${pdf}`;
    };

    // Generates a QR code image URL using a public API
    const generateQrCodeURL = (text) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    };

    // Opens your chat app with a message containing the link
    const openChatApp = (pdf) => {
        const link = getShareLink(pdf);
        // Assuming your in-app chat route includes query parameters
        navigate(`/chat?prefillMessage=Hey%2C+check+this+PDF%3A+${encodeURIComponent(link)}`);
        setShareModal({ isOpen: false, pdf: null });
    };



    return (
        <>
            <div className="bg-pattern"></div>
            <div className='mesh_ns ccf text-white pb-14 h-full min-h-screen'>


                <Navbar />
                <div className='ccf'>
                    <div className='p-4 py-16 flex flex-col text-center content-center flex-nowrap justify-center gap-3 items-center'>
                        <div>
                            <span className='text-center m-3 text-3xl md:text-lg lg:text-5xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent ccf '>Dowmload Free {choose}?</span>
                        </div>
                        <div>
                            <span className='text-center text-xl md:text-xl lg:text-2xl my-3 text-gray-300 font-medium'>for {Subject}, {sem && (sem)} </span>
                        </div>
                    </div>
                </div>




                <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-3 w-full text-white p-6'>
                    {loading ? (
                        <div className="flex justify-center items-center col-span-3">
                            <div className="border-t-2 rounded-full border-green-500 bg-gray-900 animate-spin w-8 aspect-square"></div>
                        </div>
                    ) : pdfData.length > 0 ? (
                        pdfData
                            .filter(pdf => pdf.choose === choose)
                            .map((pdf) => {
                                const isDownloading = loadingStates[pdf.id];
                                const downloadIcon = isDownloading ? "arrow_circle_down" : (downloadStates[pdf.id] || "download");
                                const shareIcon = isDownloading ? "share" : (downloadStates[pdf.id] || "share");

                                return (
                                    <div
                                        key={pdf.id}
                                        className="flex gap-2 items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-60 hover:shadow-lg hover:bg-blue-800/30 transition-all"
                                    >
                                        <img
                                            src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                                            alt="PDF Icon"
                                            className="w-12 h-12 object-contain"
                                        />

                                        <div className="flex-1 flex flex-col">
                                            <p className="text-xl truncate" title={pdf.name}>{pdf.name}</p>
                                            <p className="text-md text-slate-400">
                                                {pdfSizes[pdf.pdf] || "Loading..."} • PDF • 2025
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleDownload(pdf.pdf, pdf.name, pdf.id)}>
                                                <span className="material-symbols-outlined">{downloadIcon}</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShareModal({ isOpen: true, pdf });
                                                    setShareMessage(pdf.pdf); // use `pdf`, not `shareModal.pdf`
                                                    console.log(pdf.pdf);
                                                }}
                                            >
                                                <span className="material-symbols-outlined">{shareIcon}</span>
                                            </button>


                                        </div>
                                    </div>
                                );
                            })
                    ) : (
                        <p className="text-center text-white/60 col-span-3 mt-6">
                            No files found for the selected category.
                        </p>
                    )}
                </div>



                {shareModal.isOpen && shareModal.pdf && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        {console.log(shareModal.pdf)}
                        <div className="bg-gray-800 text-white p-6 rounded-lg relative max-w-md w-full">
                            <button
                                className="absolute top-2 right-2 text-xl"
                                onClick={() => setShareModal({ isOpen: false, pdf: null })}
                            >
                                &times;
                            </button>
                            <h2 className="text-lg font-semibold mb-4">Share "{shareModal.pdf.name}"</h2>

                            {/* QR Code */}
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={generateQrCodeURL(getShareLink(shareModal.pdf.pdf))}
                                    alt="QR Code"
                                    className="w-32 h-32 bg-white p-2"
                                />
                            </div>

                            {/* Shareable Link */}
                            <div className="mb-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={getShareLink(shareModal.pdf.pdf)}
                                    className="w-full bg-gray-700 p-2 rounded"
                                />
                            </div>
                            <div className="flex gap-2 mb-4">
                                <button
                                    className="bg-blue-500 px-3 py-1 rounded"
                                    onClick={() => navigator.clipboard.writeText(getShareLink(shareModal.pdf.pdf), setShareMessage(shareModal.pdf.pdf), console.log(shareMessage))}
                                >
                                    Copy Link
                                </button>
                                <button
                                    className="bg-green-500 px-3 py-1 rounded"
                                    onClick={() => setShowPopup(true)}
                                >
                                    Open Chat & Share
                                </button>
                            </div>

                            <p className="text-sm text-gray-300">
                                Scan or share the link—recipients can access the item and message inside the app.
                            </p>
                        </div>
                    </div>
                )}

                {showPopup && (
                    <SharePopup
                        messageToShare={shareMessage}
                        onClose={() => setShowPopup(false)}
                    />
                )}

            </div>
            <Footer />
            <div role="button" onClick={() => setIsopen(true)} data-tooltip="Upload" aria-label="Upload" data-tooltip-className="Upload" tabIndex="0" className="border border-gray-700 fixed bottom-[6rem] right-5 rounded-[50%] flex justify-center items-center text-3xl w-16 h-16 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#27272a] via-[#52525b] to-[#a1a1aa] text-white font-black">
                <div className="flex items-center justify-center bg-gradient-to-br from-white via-neutral-200 to-neutral-700 bg-clip-text text-transparent">
                    +
                </div>
            </div>
            {isopen &&
                <div className="z-50 loveff flex justify-center items-center inset-0 fixed bg-black p-4 bg-opacity-50 " >
                    <div className="flex flex-col border-2 border-white p-6 rounded-lg shadow-lg relative bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-[#1d4ed8] via-[#1e40af] to-[#111827] ">
                        <div>
                            <button
                                onClick={() => setIsopen(false)} disabled={loading}
                                className="absolute top-2 right-4 text-3xl text-red-500 dark:text-gray-100 hover:text-red-200 dark:hover:text-white "
                            >
                                x
                            </button>
                            <span className="loveff bg-gradient-to-tr from-white via-stone-400  to-neutral-300 bg-clip-text  text-transparent text-center font-black text-2xl mb-2" >Add your Notes</span>
                            <p className='text-gray-400' >for {sub} - Semester {sem}</p>

                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-4 justify-center items-center">
                                <label htmlFor="content"></label>
                                <textarea name="content" id="content"
                                    className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg"
                                    rows="4"
                                    placeholder='Description'
                                    onChange={(e) => setContent(e.target.value)}
                                    required ></textarea>
                                <label htmlFor="files"></label>
                                <input type="file" name="files" id="files " multiple
                                    onChange={handleFileChange}
                                    className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838]  rounded-lg" />

                                <button type="submit" disabled={loading} className="smky-btn3 relative text-white hover:text-[#778464] py-2 px-6 after:absolute after:h-1 after:hover:h-[200%] transition-all duration-500 hover:transition-all hover:duration-500 after:transition-all after:duration-500 after:hover:transition-all after:hover:duration-500 overflow-hidden z-20 after:z-[-20] after:bg-[#abd373] after:rounded-t-full after:w-full after:bottom-0 after:left-0 text-gray-600"> {loading ? (
                                    <div className="s-loading"></div> // Display s-loading inside the button
                                ) : (
                                    "Submit"
                                )}</button>
                            </div>
                        </form>
                    </div>
                </div>
            }
        </>
    )
}

export default Ns
