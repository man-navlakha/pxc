import React, { useEffect, useState, useCallback } from 'react';
import Cookies from "js-cookie";
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';

// --- UI Components ---
const SkeletonLoader = () => (
    <div className="space-y-8 animate-pulse">
        <div className="p-6 rounded-2xl bg-white/5 space-y-3">
            <div className="h-6 w-3/4 rounded-md bg-white/10"></div>
            <div className="h-4 w-1/2 rounded-md bg-white/10"></div>
            <div className="h-12 w-full rounded-lg bg-white/10 mt-4"></div>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 space-y-3">
            <div className="h-10 w-full rounded-lg bg-white/10"></div>
            <div className="space-y-3 mt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 w-full rounded-lg bg-white/10"></div>
                ))}
            </div>
        </div>
    </div>
);

const EmptyState = ({ onUploadClick }) => (
    <div className="text-center py-16 px-6 rounded-2xl bg-white/5 border border-white/10">
        <span className="material-symbols-outlined text-6xl text-white/20">history_edu</span>
        <h3 className="mt-4 text-2xl font-bold text-white/80">Be the First!</h3>
        <p className="mt-1 text-white/40 max-w-sm mx-auto">No answers have been contributed for this question yet. Why not upload yours?</p>
        <button onClick={onUploadClick} className="mt-6 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-semibold">
            Upload Answer
        </button>
    </div>
);

const Select = () => {
    const { sid } = useParams();
    const [answerPdfs, setAnswerPdfs] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // --- FIX: Get the main "Question" PDF details from cookies ---
    const pdfID = sid || Cookies.get("pdfid");
    const questionPdf = {
        id: pdfID,
        name: Cookies.get("pdfname"),
        year: Cookies.get("pdfyear"),
        size: Cookies.get("pdfSizes"),
        url: Cookies.get("pdfurl"),
        sub: Cookies.get("sub"),
    };

    // --- FIX: Fetch only the "Answers" from your existing API ---
    useEffect(() => {
        if (!pdfID) {
            toast.error("No document ID found.");
            setLoading(false);
            return;
        }

        const fetchAnswers = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://pixel-classes.onrender.com/api/home/AnsPdf/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: pdfID })
                });

                if (!response.ok) throw new Error("Failed to fetch answers.");
                
                const data = await response.json();
                setAnswerPdfs(data || []);

                // Fetch sizes for each answer PDF (re-instated logic)
                const sizes = {};
                await Promise.all((data || []).map(async (pdf) => {
                    if (pdf.pdf) {
                        try {
                            const res = await fetch(pdf.pdf, { method: 'HEAD' });
                            const size = res.headers.get('Content-Length');
                            sizes[pdf.pdf] = size ? (parseInt(size) / 1024 / 1024).toFixed(2) + ' MB' : 'N/A';
                        } catch {
                            sizes[pdf.pdf] = 'N/A';
                        }
                    }
                }));
                setPdfSizes(sizes);

            } catch (error) {
                console.error("Error fetching answers:", error);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnswers();
    }, [pdfID]);

    const handleFileChange = (e) => setFiles(Array.from(e.target.files));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!content.trim() || files.length === 0) {
            return toast.warn("Please provide a description and select at least one file.");
        }
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("name", Cookies.get("username") || "Anonymous");
            formData.append("content", content);
            formData.append("id", pdfID);
            files.forEach(file => formData.append("pdf", file));

            const res = await fetch("https://pixel-classes.onrender.com/api/home/upload_pdf/", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed. Please try again.");
            
            toast.success("Upload successful! Your answer may take a moment to appear.");
            setIsUploadOpen(false);
            setContent("");
            setFiles([]);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (pdfUrl, pdfName) => {
        if (!pdfUrl) return toast.error("No download URL available.");
        toast.info(`Starting download for ${pdfName}`);
        try {
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${pdfName}.pdf` || 'download.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Download failed.");
        }
    };
    
    return (
        <>
        <div className='mesh_select ccf min-h-screen text-white'>
            <Navbar />
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loading ? <SkeletonLoader /> : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-1 lg:sticky top-24">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-white/50 mb-2">Question Paper</p>
                                    <h1 className='text-2xl font-bold text-white mb-3'>{questionPdf?.name || "No Question Found"}</h1>
                                    <p className="text-sm text-white/50">{questionPdf?.size || "..."} • PDF • {questionPdf?.year || "..."}</p>
                                    <button
                                        onClick={() => handleDownload(questionPdf?.url, questionPdf?.name)}
                                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-semibold"
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                        Download Question
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-2">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-3xl font-bold">Answers ({answerPdfs.length})</h2>
                                    <button onClick={() => setIsUploadOpen(true)} className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-semibold">
                                        Contribute
                                    </button>
                                </div>

                                {answerPdfs.length > 0 ? (
                                    <motion.ul initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-4">
                                        {answerPdfs.map((pdf, index) => (
                                            <motion.li key={index} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/20 hover:bg-white/10 transition-all">
                                                    <img src={pdf.uploader_pic || `https://www.freeiconspng.com/uploads/pdf-icon-9.png`} alt={pdf.name} className="w-10 h-10 rounded-full object-cover" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className='font-semibold truncate'>{pdf.contant}</p>
                                                        <p className="text-sm text-white/50">by {pdf.name} • {pdfSizes[pdf.pdf] || "..."}</p>
                                                    </div>
                                                    <button onClick={() => handleDownload(pdf.pdf, `Answer by ${pdf.name}`)} className="p-3 rounded-full bg-white/5 hover:bg-blue-500/50 transition-colors">
                                                        <span className="material-symbols-outlined">download</span>
                                                    </button>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </motion.ul>
                                ) : (
                                    <EmptyState onUploadClick={() => setIsUploadOpen(true)} />
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {isUploadOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900/70 border border-white/20 p-6 rounded-2xl relative w-full max-w-md">
                            <button onClick={() => setIsUploadOpen(false)} disabled={isUploading} className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors">&times;</button>
                            <h2 className="text-2xl font-bold">Contribute Your Answer</h2>
                            <p className='text-white/50 mb-4'>for {questionPdf?.name}</p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <textarea className="w-full p-3 border border-white/20 text-white bg-white/5 rounded-lg" rows="3" placeholder='Brief description (e.g., "Complete handwritten notes")' value={content} onChange={(e) => setContent(e.target.value)} required />
                                <input type="file" multiple onChange={handleFileChange} className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                <button type="submit" disabled={isUploading} className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    {isUploading ? "Uploading..." : "Submit Answer"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
            <Footer />
            </>
    );
};

export default Select;