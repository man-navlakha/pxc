// /pages/Ns.js

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';
import SharePopup from '../../componet/SharePopup';
import '../../new.css';

// hook: useHandleQueryParams
function useHandleQueryParams() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const choose = params.get('choose');
        const sub = params.get('sub');
        const id = params.get('id');
        const course = params.get('course');

        if (choose === 'Assignment' || choose === 'imp') {
            Cookies.set("from", "email");
            // navigate(`/select?sub=${sub}&id=${id}&course=${course}&choose=${choose}`);
        }

        if (choose === 'Notes') {
            Cookies.set("from", "email");
            // navigate(`/ns/${sub}/${choose}`);
        }

        // Cleanup
        ["sub", "pdfid", "course", "choose"].forEach(c => Cookies.remove(c));
    }, [navigate]);
}

// hook: useFetchPdfData
function useFetchPdfData(subject) {
    const [pdfData, setPdfData] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!subject) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('https://pixel-classes.onrender.com/api/home/QuePdf/Subject_Pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ course_name: "B.C.A", sub: subject })
                });

                const data = await res.json();
                setPdfData(data);

                const sizes = {};
                await Promise.all(data.map(async (pdf) => {
                    if (pdf.pdf) {
                        const response = await fetch(pdf.pdf, { method: 'HEAD' });
                        const size = response.headers.get('Content-Length');
                        if (size) sizes[pdf.pdf] = (size / 1024).toFixed(2) + ' KB';
                    }
                }));
                setPdfSizes(sizes);
            } catch (e) {
                console.error("Error fetching PDF data:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subject]);

    return { pdfData, pdfSizes, loading };
}

// hook: useDownloadHandler
function useDownloadHandler() {
    const [downloadStates, setDownloadStates] = useState({});
    const [loadingStates, setLoadingStates] = useState({});

    const handleDownload = async (pdfUrl, pdfName, pdfId) => {
        const getHistory = () => {
            try {
                return JSON.parse(localStorage.getItem('downloadHistory')) || [];
            } catch {
                return [];
            }
        };

        const saveHistory = (history) => {
            localStorage.setItem('downloadHistory', JSON.stringify(history.slice(0, 50)));
        };

        setLoadingStates(prev => ({ ...prev, [pdfId]: true }));
        setDownloadStates(prev => ({ ...prev, [pdfId]: 'downloading' }));

        try {
            const res = await fetch(pdfUrl);
            const buffer = await res.arrayBuffer();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });

            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${pdfName}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(a.href);

            setDownloadStates(prev => ({ ...prev, [pdfId]: 'done' }));
            const history = getHistory();
            history.unshift({ pdfName, pdfUrl, downloadDate: new Date().toISOString() });
            saveHistory(history);
        } catch (err) {
            console.error("Download failed:", err);
            setDownloadStates(prev => ({ ...prev, [pdfId]: 'error' }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [pdfId]: false }));
        }
    };

    return { handleDownload, downloadStates, loadingStates };
}

// hook: useShareHandler
function useShareHandler() {
    const [shareModal, setShareModal] = useState({ isOpen: false, pdf: null });
    const [shareMessage, setShareMessage] = useState("");

    const getShareLink = (pdfUrl) => {
        return pdfUrl; // could replace with your deep linking logic
    };

    const generateQrCodeURL = (url) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    };

    const openShareModal = (pdf) => {
        setShareModal({ isOpen: true, pdf });
        setShareMessage(getShareLink(pdf.pdf));
    };

    return {
        shareModal,
        setShareModal,
        shareMessage,
        setShareMessage,
        openShareModal,
        getShareLink,
        generateQrCodeURL
    };
}


const Ns = () => {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);

    // Hooks
    const { pdfData, pdfSizes, loading } = useFetchPdfData(Subject);
    const { handleDownload, downloadStates, loadingStates } = useDownloadHandler();
    const {
        shareModal, setShareModal, shareMessage,
        setShareMessage, openShareModal, getShareLink, generateQrCodeURL
    } = useShareHandler();

    // Query Param Redirect
    useHandleQueryParams();

    // Redirect if category is imp/assignment
    React.useEffect(() => {
        if (["Assignment", "imp"].includes(choose)) {
            // navigate(`/nss/${Subject}/${choose}`);
        }
    }, [choose, Subject, navigate]);

    return (
        <>
            <div className="bg-pattern"></div>
            <div className='mesh_ns ccf text-white pb-14 h-full min-h-screen'>
                <Navbar />

                <div className='ccf'>
                    <div className='p-4 py-16 flex flex-col text-center content-center flex-nowrap justify-center gap-3 items-center'>
                        <h1 className='text-3xl md:text-lg lg:text-5xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent'>
                            Download Free {choose === "exam_papper" ? "Exam Paper" : choose}
                        </h1>
                        <p className='text-xl md:text-xl lg:text-2xl my-3 text-gray-300 font-medium'>
                            for {Subject}, {sem}
                        </p>
                    </div>
                </div>

                <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-3 w-full text-white p-6'>
                    {loading ? (
                        <div className="flex justify-center items-center col-span-3">
                            <div className="border-t-2 rounded-full border-green-500 bg-gray-900 animate-spin w-8 aspect-square"></div>
                        </div>
                    ) : pdfData.filter(pdf => pdf.choose === choose).length > 0 ? (
                        pdfData
                            .filter(pdf => pdf.choose === choose)
                            .map(pdf => (
                                <div
                                    key={pdf.id}
                                    className="flex gap-1 items-center py-4 px-3 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-60 hover:shadow-lg hover:bg-blue-800/30 transition-all"
                                >
                                    <img
                                        src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                                        alt="PDF Icon"
                                        className="w-12 h-12 object-contain"
                                    />

                                    <div className="flex-1 flex flex-col min-w-0">
                                        <p className="text-xl truncate" title={pdf.name}>{pdf.name}</p>
                                        <p className="text-md text-slate-400">
                                            {pdfSizes[pdf.pdf] || "Loading..."} • PDF • 2025
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
                                                {downloadStates[pdf.id] || "share"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p className="text-center text-white/60 col-span-3 mt-6">
                            No files found for the selected category.
                        </p>
                    )}
                </div>

                {/* Share Modal */}
                {shareModal.isOpen && shareModal.pdf && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 text-white p-6 rounded-lg relative max-w-md w-full">
                            <button
                                className="absolute top-2 right-2 text-xl"
                                onClick={() => setShareModal({ isOpen: false, pdf: null })}
                            >
                                &times;
                            </button>
                            <h2 className="text-lg font-semibold mb-4">Share "{shareModal.pdf.name}"</h2>

                            <div className="mb-4 flex justify-center">
                                <img
                                    src={generateQrCodeURL(getShareLink(shareModal.pdf.pdf))}
                                    alt="QR Code"
                                    className="w-32 h-32 bg-white p-2"
                                />
                            </div>

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
                                    onClick={() => {
                                        navigator.clipboard.writeText(getShareLink(shareModal.pdf.pdf));
                                        setShareMessage(getShareLink(shareModal.pdf.pdf));
                                    }}
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
        </>
    );
};

export default Ns;