import React, { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import SharePopup from '../componet/SharePopup';

import useShareHandler from '../hooks/useShareHandler';
import Navbar from '../componet/Navbar';
import Footer from '../componet/Footer';
// --- Menu Options ---
const menuOptions = [
    { key: 'all', label: '🌏 All' },
    { key: 'assignment', label: '📚 Assignments' },
    { key: 'notes', label: '📝 Notes' },
    { key: 'imp', label: '❓ IMP Q&A' },
    { key: 'exam_papper', label: '📄 Exam Papers' },
    { key: 'practical', label: '🧑‍💻 General Book' },
];
const Optio = [
    { key: 'notes', label: '📝 Notes' },
    { key: 'exam_papper', label: '📄 Exam Papers' },
    { key: 'practical', label: '🧑‍💻 General Book' },
];


import useFileUploadHandler from '../hooks/useFileUploadHandler';
import useDownloadHandler from '../hooks/useDownloadHandler';


// --- UI Components ---
const DownloadIcon = () => (
    <span className="material-symbols-outlined text-xl">download</span>
);
const ShareIcon = () => (
    <span className="material-symbols-outlined text-xl">share</span>
);
const OpenInNewIcon = () => (
    <span className="material-symbols-outlined">open_in_new</span>
);
const ErrorIcon = () => (
    <span className="material-symbols-outlined text-red-400 text-4xl mb-2">error</span>
);




const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
);


const SubjectPage = () => {
    const navigate = useNavigate();
    const { subject, sem } = useParams();
    const [isopen, setIsopen] = useState(false);
    const [choose, setChoose] = useState('');


    const courseDetails = {
        courseName: "B.C.A",
        subjectName: subject || "Failed",
        semester: sem || "5",
    };

    // State for the active menu option, default to 'all'
    const [activeOption, setActiveOption] = useState('all');

    // State for API data
    const [allPdfData, setAllPdfData] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // New state for handling errors


    const {
        files, content, setContent, handleFileChange,
        handleSubmit, isUploading
    } = useFileUploadHandler();

    const { handleDownload, downloadStates, loadingStates } = useDownloadHandler();


    const [showPopup, setShowPopup] = useState(false);

    const {
        shareModal,
        setShareModal,
        shareMessage,
        setShareMessage,
        getShareLink,
        generateQrCodeURL,
        openShareModal,
    } = useShareHandler();

    const handleCopyLink = () => {
        const link = getShareLink(shareModal.pdf.pdf);
        navigator.clipboard.writeText(link);
        setShareMessage(link);
    };



    // --- API Fetching Logic ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null); // Reset error on new fetch
            try {
                console.log(`Fetching all PDFs for subject: ${courseDetails.subjectName}`);
                const res = await fetch('https://pixel-classes.onrender.com/api/home/QuePdf/Subject_Pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ course_name: courseDetails.courseName, sub: courseDetails.subjectName })
                });

                if (!res.ok) {
                    throw new Error(`API request failed with status ${res.status}`);
                }

                const data = await res.json();

                // ROBUSTNESS FIX: Ensure the API response is an array before processing
                if (!Array.isArray(data)) {
                    throw new Error("API did not return an array of documents.");
                }

                console.log('API Data Received:', data);
                const dataWithIds = data.map((item, index) => ({ ...item, id: item.id || index }));
                setAllPdfData(dataWithIds);

                // Fetch sizes for each PDF
                const sizes = {};
                await Promise.all(dataWithIds.map(async (pdf) => {
                    if (pdf.pdf) {
                        try {
                            const response = await fetch(pdf.pdf, { method: 'HEAD' });
                            const size = response.headers.get('Content-Length');
                            if (size) {
                                sizes[pdf.pdf] = (parseInt(size) / 1024).toFixed(2) + ' KB';
                            } else {
                                sizes[pdf.pdf] = 'Size N/A';
                            }
                        } catch (headError) {
                            console.warn(`Could not fetch HEAD for ${pdf.pdf}:`, headError.message);
                            sizes[pdf.pdf] = 'N/A';
                        }
                    }
                }));
                setPdfSizes(sizes);

            } catch (e) {
                console.error("Error fetching PDF data:", e);
                setError(e.message || "Could not load documents. The server might be offline.");
                setAllPdfData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty array means this effect runs only once

    const handleopen = useCallback((pdfId, size, url, name, year) => {
        console.log("Opening PDF with:", { pdfId, size, url, name, year });

        Cookies.set("pdfid", pdfId);
        Cookies.set("pdfSizes", size);
        Cookies.set("pdfurl", url);
        Cookies.set("pdfname", name);
        Cookies.set("pdfyear", year);

        navigate(`/select/${pdfId}`);

    }, [navigate]);


    console.log(handleopen)

    const handleNavigation = (subject, choice) => {
        if (["assignment", "imp"].includes(choice)) {
            navigate(`/nss/${subject}/${choice}`);
        }
    };

    const filteredPdfs = activeOption.toLowerCase() === 'all'
        ? allPdfData
        : allPdfData.filter(pdf => {
            const pdfType = (pdf.Type || pdf.choose || '').trim().toLowerCase();
            const selectedCategory = activeOption.trim().toLowerCase();
            return pdfType === selectedCategory;
        });

    const normalizeType = (type) => (type || '').trim().toLowerCase().replace(/\s+/g, '_');


    const getCategoryCounts = () => {
        const counts = {};
        allPdfData.forEach(pdf => {
            const type = (pdf.Type || pdf.choose || '').trim().toLowerCase();
            if (!counts[type]) counts[type] = 0;
            counts[type]++;
        });
        return counts;
    };
    const categoryCounts = getCategoryCounts();


    return (
        <div className=" ccf mesh_ns ccf min-h-screen text-white flex flex-col">
            <Navbar />

            <div className="flex-1 w-full px-4 sm:px-6 md:px-10 py-4 max-w-6xl mx-auto">

                {/* HEADER */}
                <header className="mt-6 sm:mt-10 mb-6 border-b border-white/20">
                    <h1 className="text-3xl fc  sm:text-4xl font-bold">{courseDetails.subjectName}</h1>
                    <h2 className="text-lg sm:text-xl font-light opacity-80">Semester {courseDetails.semester}</h2>
                </header>

                {/* CATEGORY NAV */}
                <nav className="mb-6">
                    <div className="flex overflow-x-auto space-x-2 sm:space-x-4 no-scrollbar">
                        {menuOptions.map((option) => {
                            const key = option.key.toLowerCase();
                            const count = categoryCounts[key] || 0;
                            return (
                                <button
                                    key={option.key}
                                    onClick={() => setActiveOption(option.key)}
                                    className={`relative px-4 py-2 text-sm sm:text-base font-medium transition duration-300 whitespace-nowrap rounded-md ${activeOption === option.key
                                        ? 'text-white bg-white/20'
                                        : 'text-white/60 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {option.label} {key !== 'all' && `(${count})`}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* MAIN CONTENT */}
                <main className="bg-black/20 rounded-lg p-4 sm:p-6 mb-10">
                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <div className="flex flex-col justify-center items-center text-center text-white/80 py-20">
                            <ErrorIcon />
                            <p className="font-semibold">Request Failed</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    ) : filteredPdfs.length > 0 ? (
                        <ul className="space-y-4">

                            {filteredPdfs.map((pdf) => (
                                ['assignment', 'imp'].includes(normalizeType(pdf.choose)) ? (
                                    <li
                                        key={pdf.id} onClick={() => handleopen(pdf.id, pdfSizes[pdf.pdf], pdf.pdf, pdf.name, pdf.year)}
                                        className="flex gap-2 items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900/60 backdrop-blur hover:shadow-lg hover:bg-gray-800/30 transition-all"
                                    >
                                        <img src="https://www.freeiconspng.com/uploads/pdf-icon-9.png" alt="PDF Icon" className="w-12 h-12 object-contain" />
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <p className="text-lg sm:text-xl truncate" title={pdf.name}>{pdf.name || pdf.title}</p>
                                            <p className="text-sm sm:text-md text-slate-400">
                                                {pdfSizes[pdf.pdf] || "..."} • PDF • {pdf.year || 2025}
                                                {pdf.choose ? ` • ${pdf.choose}` : ''}
                                            </p>
                                        </div>
                                        <div className="group relative cursor-pointer">
                                            <OpenInNewIcon />
                                        </div>
                                    </li>
                                ) : (
                                    <li
                                        key={pdf.id}
                                        className="flex gap-1 items-center py-4 px-3 justify-between rounded-2xl border border-gray-200/50 bg-gray-900/60 backdrop-blur hover:shadow-lg hover:bg-gray-800/30 transition-all"
                                    >
                                        <img src="https://www.freeiconspng.com/uploads/pdf-icon-9.png" alt="PDF Icon" className="w-12 h-12 object-contain" />
                                        <div className="flex-1 flex flex-col min-w-0 mx-3">
                                            <p className="text-lg sm:text-xl truncate" title={pdf.name}>{pdf.name || pdf.title}</p>
                                            <p className="text-sm sm:text-md text-slate-400">
                                                {pdfSizes[pdf.pdf] || "..."} • PDF • {pdf.year || 2025}
                                                {pdf.choose ? ` • ${pdf.choose}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                className='bg-blue-600/30 hover:bg-black/30 rounded px-3 py-2 flex items-center justify-center'
                                                onClick={() => handleDownload(pdf.pdf, pdf.name, pdf.id)}
                                            >
                                                <span className="material-symbols-outlined">
                                                    {loadingStates[pdf.id] ? "arrow_circle_down" : downloadStates[pdf.id] || "download"}
                                                </span>
                                            </button>
                                            <button
                                                className='bg-blue-600/30 hover:bg-black/30 rounded px-3 py-2 flex items-center justify-center'
                                                onClick={() => openShareModal(pdf)}
                                            >
                                                <span className="material-symbols-outlined">
                                                    {"share"}
                                                </span>
                                            </button>
                                        </div>
                                    </li>
                                )
                            ))}
                        </ul>
                    ) : (
                        <div className="flex justify-center items-center text-white/70 text-center py-20">
                            <p>No documents found for the "{activeOption}" category.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* SHARE MODAL + POPUP */}
            <>
                {shareModal.isOpen && shareModal.pdf && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 text-white p-6 rounded-lg relative max-w-md w-full">
                            <button
                                className="absolute top-2 right-2 text-xl"
                                onClick={() => setShareModal({ isOpen: false, pdf: null })}
                            >
                                &times;
                            </button>
                            <h2 className="text-lg font-semibold mb-4">
                                Share "{shareModal.pdf.name}"
                            </h2>
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={generateQrCodeURL(getShareLink(shareModal.pdf.pdf))}
                                    alt="QR Code"
                                    className="w-32 h-32 bg-white p-2"
                                />
                            </div>
                            <input
                                type="text"
                                readOnly
                                value={getShareLink(shareModal.pdf.pdf)}
                                className="w-full bg-gray-700 p-2 rounded mb-4"
                            />
                            <div className="flex gap-2 mb-4">
                                <button className="bg-gray-500 px-3 py-1 rounded" onClick={handleCopyLink}>Copy Link</button>
                                <button className="bg-green-500 px-3 py-1 rounded" onClick={() => setShowPopup(true)}>Open Chat & Share</button>
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
            </>


            <>
                {/* Upload Floating Button */}
                {["notes", "exam_papper", "practical"].includes(activeOption) && (
                    <div
                        role="button"
                        onClick={() => setIsopen(true)}
                        className="border border-gray-700 fixed bottom-[6rem] right-5 rounded-[50%] flex justify-center items-center text-3xl w-16 h-16 bg-gradient-to-br from-[#27272a] via-[#52525b] to-[#a1a1aa] text-white font-black"
                    >
                        <div className="flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-700">
                            <span class="material-symbols-outlined font-black text-4xl">
                                add
                            </span>
                        </div>
                    </div>
                )}

                {/* Upload Modal */}
                {isopen && (
                    <div className="z-50 loveff flex justify-center items-center inset-0 fixed bg-black p-4 bg-opacity-50">
                        <div className="flex flex-col  w-full max-w-[360px] border-2 border-white p-6 rounded-lg shadow-lg relative bg-gradient-to-br from-[#1d4ed8] via-[#1e40af] to-[#111827]">
                            <button
                                onClick={() => setIsopen(false)}
                                className="absolute top-2 right-4 text-3xl text-red-500 hover:text-red-200"
                                disabled={isUploading}
                            >
                               <span class="material-symbols-outlined font-black text-2xl">
close
</span>
                            </button>
                            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-white via-stone-400 to-neutral-300">Add your Notes</h2>
                            <p className='text-gray-400 mb-4'>for {subject} - Semester {sem}</p>

                            <form
                            className='justify-center items-center'
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                                setIsopen(false);
                            }}>
                                <input type="hidden" className='text-black' value={sem} onChange={(e) => setSem(e.target.value)} name="" />


                                <input type="hidden" className='text-black' value={"1"} onChange={(e) => setCource(e.target.value)} name="" />
                                <input type="hidden" className='text-black' value={subject} onChange={(e) => setSubject(e.target.value)} name="" />
                                <select
                                    className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg mb-4"
                                    value={choose}
                                    required
                                    onChange={(e) => setChoose(e.target.value)}
                                >
                                    <option value="" disabled>
                                        -- Select Category --
                                    </option>

                                    {Optio.map(opt => (
                                        <option
                                            key={opt.key}
                                            value={opt.key}
                                            disabled={opt.key === 'all'}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>

                                <textarea
                                    className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg mb-4"
                                    rows="4"
                                    placeholder='Description or Title Ex. Module 1: ABCD'
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                />
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg mb-4"
                                />
                                <button type="submit"
                                    disabled={isUploading}
                                    class="smky-btn3 relative hover:text-[#778464] py-2 px-6 after:absolute after:h-1 after:hover:h-[200%] transition-all duration-500 hover:transition-all hover:duration-500 after:transition-all after:duration-500 after:hover:transition-all after:hover:duration-500 overflow-hidden z-20 after:z-[-20] after:bg-[#abd373] after:rounded-t-full after:w-full after:bottom-0 after:left-0 text-gray-200">
                                    {isUploading ? <div className="s-loading"></div> : "Submit"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </>

            <Footer />
        </div>

    );
};

export default SubjectPage;

