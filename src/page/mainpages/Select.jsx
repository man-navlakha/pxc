import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import '../../new.css';
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';
import { useParams } from 'react-router-dom';

const Select = () => {
    const [loading, setLoading] = useState(false);
    const [downloadStates, setDownloadStates] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [isOpen, setIsOpen] = useState(false);

    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);
    const [pdfData, setPdfData] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});

    const { sid } = useParams();
    const params = new URLSearchParams(window.location.search);

    // Getting pdfID from URL params, Cookies or sid
    const pdfID = sid || Cookies.get("id") || Cookies.get("pdfid") || params.get("pdfid");
    const pdfname = Cookies.get("pdfname");
    const pdfyear = Cookies.get("pdfyear");
    const pdfsize = Cookies.get("pdfSizes");
    const pdfurl = Cookies.get("pdfurl");
    const sub = Cookies.get("sub");

    // Always call useEffect, but inside check for pdfname



    // Fetch PDF data from API
    useEffect(() => {
        if (!pdfID) return;

        const fetchPDFs = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://pixel-classes.onrender.com/api/home/AnsPdf/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: pdfID })
                });

                const data = await response.json();
                setPdfData(data);

                // Fetch sizes for all PDFs
                data.forEach(pdf => {
                    if (pdf.pdf) fetchPdfSize(pdf.pdf);
                });
            } catch (error) {
                console.error("Error fetching PDFs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPDFs();
    }, [pdfID]);

    // Fetch PDF file size
    const fetchPdfSize = async (url) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentLength = response.headers.get('Content-Length');
            if (contentLength) {
                setPdfSizes(prev => ({
                    ...prev,
                    [url]: (contentLength / (1024 * 1024)).toFixed(2) + ' MB'
                }));
            }
        } catch (error) {
            console.error('Error fetching PDF size:', error);
        }
    };

    // File input change handler
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    // Submit form handler to upload answer PDFs
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!content.trim() || files.length === 0) {
            alert("Please provide description and select files.");
            return;
        }

        const username = Cookies.get("username");
        if (!pdfID) {
            alert("Missing ID to upload answer.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", username);
            formData.append("content", content);
            formData.append("id", pdfID);
            files.forEach(file => formData.append("pdf", file));

            const res = await fetch("https://pixel-classes.onrender.com/api/home/upload_pdf/", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            alert("Upload successful");
            setIsOpen(false);
            setContent("");
            setFiles([]);
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    // Handle PDF download, update states and store history in localStorage
    const handleDownload = async (pdfUrl, pdfName, pdfId) => {

        console.log("Initiating download...");
        console.log("PDF URL:", pdfUrl);
        console.log("PDF Name:", pdfName);

        const getDownloadHistory = () => {
            try {
                const historyString = localStorage.getItem('downloadHistory');
                return historyString ? JSON.parse(historyString) : [];
            } catch (error) {
                console.error("Error parsing download history:", error);
                return [];
            }
        };

        const saveDownloadHistory = (history) => {
            try {
                const MAX_HISTORY_ITEMS = 50;
                if (history.length > MAX_HISTORY_ITEMS) {
                    history = history.slice(0, MAX_HISTORY_ITEMS);
                }
                localStorage.setItem('downloadHistory', JSON.stringify(history));
            } catch (error) {
                console.error("Error saving download history:", error);
            }
        };

        setLoadingStates(prev => ({ ...prev, [pdfId]: true }));
        setDownloadStates(prev => ({ ...prev, [pdfId]: 'downloading' }));

        try {
            const response = await fetch(pdfUrl);
            const arrayBuffer = await response.arrayBuffer();

            const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

            const anchor = document.createElement("a");
            anchor.href = URL.createObjectURL(blob);
            anchor.download = `${pdfName}.pdf` || "download.pdf";
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(anchor.href);

            setDownloadStates(prev => ({ ...prev, [pdfId]: 'download_done' }));

            const history = getDownloadHistory();
            history.unshift({
                pdfName,
                pdfUrl,
                downloadDate: new Date().toISOString()
            });
            saveDownloadHistory(history);
            console.log("Downloading from URL:", pdfUrl);

        } catch (error) {
            console.error("Download failed:", error);
            setDownloadStates(prev => ({ ...prev, [pdfId]: 'error' }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [pdfId]: false }));
        }
    };

    return (
        <>
            <div className='mesh_select h-screen ccf overflow-y-scroll'>
                <Navbar />
                <div className='ccf'>
                    <div className='py-16 flex flex-col text-center justify-center items-center'>
                        <span className='text-3xl md:text-lg lg:text-3xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent'>
                            Get Answer of {pdfname} for free?
                        </span>
                    </div>
                </div>

                <div className='mx-6'>
                    <div
                        onClick={() => handleDownload(pdfurl, pdfname, pdfID)}
                        className="flex gap-2 max-w-[100vw] text-white items-center px-6 p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-30 hover:shadow-lg hover:bg-blue-500/20 backdrop-saturate-100 backdrop-contrast-100 lg:min-w-[384px]"
                    >
                        <img
                            src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                            alt="PDF Icon"
                            className="w-12 h-12 object-contain"
                        />
                        <div className='flex-1 flex flex-col ml-2'>
                            <p className='text-lg mb-2'>{pdfname}</p>
                            <p className="text-sm text-slate-400">{pdfsize} • PDF • {pdfyear}</p>
                        </div>
                        <div className="group relative mr-31">
                            <button>
                                <span className="material-symbols-outlined">
                                    {loadingStates[pdfID] ? 'arrow_circle_down' : (downloadStates[pdfID] || 'download')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className='mx-6 font-bold text-white py-4'>
                    <span>Answers of {pdfname}</span>
                </div>

                <div className='grid gap-2 nd:grid-cols-1 lg:grid-cols-3 w-full text-white px-6 mb-6'>
                    {loading ? (
                        <div className="flex justify-center items-center col-span-3">
                            <div className="border-t-2 rounded-full border-green-500 bg-gray-900 animate-spin aspect-square w-8 flex justify-center items-center text-yellow-700"></div>
                        </div>
                    ) : (
                        pdfData.length > 0 ? (
                            pdfData.map((pdf, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleDownload(pdf.pdf, `Answer of ${pdfname} by ${pdf.name}`, pdf.id)}
                                    className="flex gap-2 max-w-[100vw] text-white items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-30 hover:shadow-lg hover:bg-blue-800/30 backdrop-saturate-100 backdrop-contrast-100 lg:min-w-[384px]"
                                >
                                    <img
                                        src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                                        alt="PDF Icon"
                                        className="w-12 h-12 object-contain"
                                    />
                                    <div className='flex-1 flex flex-col'>
                                        <p className='text-xl'>{pdf.contant}</p>
                                        <div>
                                            <p className="text-md text-slate-400">
                                                {pdfSizes[pdf.pdf] || "Loading..."} • PDF • {pdfyear}
                                            </p>
                                            <a href={`/profile/${pdf.name}`}>
                                                <p className='text-md pb-1'>@<span className='text-gray-100'>{pdf.name}</span></p>
                                            </a>
                                        </div>
                                    </div>
                                    <div className="group relative mr-31">
                                        <button>
                                            <span className="material-symbols-outlined">
                                                {loadingStates[pdf.id] ? 'arrow_circle_down' : (downloadStates[pdf.id] || 'download')}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No file for this</p>
                        )
                    )}
                </div>
            </div>

            
             <div
        role="button"
        onClick={() => setIsOpen(true)}
        className="border border-gray-700 fixed bottom-[6rem] right-5 rounded-[50%] flex justify-center items-center text-3xl w-16 h-16 bg-gradient-to-br from-[#27272a] via-[#52525b] to-[#a1a1aa] text-white font-black"
    >
        <div className="flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-700">
                            <span class="material-symbols-outlined font-black text-4xl">
                                add
                            </span>
                        </div>
    </div>

            {isOpen && (
                <div className="fixed ccf inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
                    <div className="relative flex flex-col p-6 rounded-lg border-2 border-white shadow-lg bg-gradient-to-br from-[#1d4ed8] via-[#1e40af] to-[#111827]">
                        <button
                            disabled={loading}
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-4 text-3xl text-red-500 hover:text-red-200"
                        >
                            x
                        </button>
                        <span className="text-2xl font-black text-transparent bg-gradient-to-tr from-white via-stone-400 to-neutral-300 bg-clip-text mb-2 text-center">
                            Add your Answer PDF
                        </span>
                        <p className='text-gray-400'>
                            for {sub},<br />in {pdfname}
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                            <textarea
                                name="content"
                                id="content"
                                rows="4"
                                placeholder='Description'
                                className="w-full p-2 rounded-lg border border-gray-300 bg-[#383838] text-gray-100"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                            <input
                                type="file"
                                name="files"
                                id="files"
                                multiple
                                className="w-full p-2 rounded-lg border border-gray-300 bg-[#383838] text-gray-100"
                                onChange={handleFileChange}
                            />
                            <button type="submit"
                                    disabled={loading}
                                    class="smky-btn3 relative hover:text-[#778464] py-2 px-6 after:absolute after:h-1 after:hover:h-[200%] transition-all duration-500 hover:transition-all hover:duration-500 after:transition-all after:duration-500 after:hover:transition-all after:hover:duration-500 overflow-hidden z-20 after:z-[-20] after:bg-[#abd373] after:rounded-t-full after:w-full after:bottom-0 after:left-0 text-gray-200">
                                   {loading ? <div className="s-loading"></div> : "Submit"}
                                </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default Select;
