import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from '../componet/Navbar';
import Footer from '../componet/Footer';
import SharePopup from '../componet/SharePopup';
import useFileUploadHandler from '../hooks/useFileUploadHandler';
import useDownloadHandler from '../hooks/useDownloadHandler';
import useShareHandler from '../hooks/useShareHandler';

// --- UNIFIED MENU OPTIONS ---
const menuOptions = [
    { key: 'all', label: '🌏 All' },
    { key: 'notes', label: '📝 Notes', uploadable: true },
    { key: 'assignment', label: '📚 Assignments' },
    { key: 'imp', label: '❓ IMP Q&A' },
    { key: 'exam_papper', label: '📄 Exam Papers', uploadable: true },
    { key: 'practical', label: '🧑‍💻 General Book', uploadable: true },
];
const uploadOptions = menuOptions.filter(opt => opt.uploadable);

// --- SELF-CONTAINED UI COMPONENTS ---
const LoadingSkeleton = () => (
    <div className="relative p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="animate-pulse flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-white/10 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-md bg-white/10"></div>
                <div className="h-3 w-1/2 rounded-md bg-white/10"></div>
            </div>
            <div className="h-8 w-16 rounded-md bg-white/10"></div>
        </div>
    </div>
);

const EmptyState = ({ category }) => (
    <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-white/20">search_off</span>
        <h3 className="mt-4 text-2xl font-bold text-white/80">No Documents Found</h3>
        <p className="mt-1 text-white/40">There are no documents in the "{category}" category yet.</p>
    </div>
);

const ErrorState = ({ error }) => (
    <div className="flex flex-col justify-center items-center text-center text-white/80 py-20">
        <span className="material-symbols-outlined text-red-400 text-6xl mb-2">error</span>
        <p className="text-xl font-semibold">Could Not Load Documents</p>
        <p className="text-sm text-white/40 max-w-sm">{error}</p>
    </div>
);

const SubjectPage = () => {
  const { subject, sem } = useParams();
  const navigate = useNavigate();

  const [activeOption, setActiveOption] = useState('all');
  const [allPdfData, setAllPdfData] = useState([]);
  const [pdfSizes, setPdfSizes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

    const [choose, setChoose] = useState('');

    const { files, content, setContent, setChoise,
  setSub,
  choise,
  setSemester, handleFileChange, handleSubmit, isUploading } = useFileUploadHandler();
    const { handleDownload, downloadStates, loadingStates } = useDownloadHandler();
    const { shareModal, setShareModal, shareMessage, setShareMessage, getShareLink, generateQrCodeURL, openShareModal } = useShareHandler();
    const [showShareChatPopup, setShowShareChatPopup] = useState(false);




  useEffect(() => {
    setSub(subject);
    setSemester(sem);
  }, [subject, sem]);



    const handleopen = useCallback((pdfId, size, url, name, year) => {
        console.log("Opening PDF with:", { pdfId, size, url, name, year });
        Cookies.set("pdfid", pdfId);
        Cookies.set("pdfSizes", size);
        Cookies.set("pdfurl", url);
        Cookies.set("pdfname", name);
        Cookies.set("pdfyear", year);
        navigate(`/select/${pdfId}`);
    }, [navigate]);
    // State specifically for the upload form's select input


    const handleCopyLink = () => {
        const link = getShareLink(shareModal.pdf.pdf);
        navigator.clipboard.writeText(link);
        setShareMessage(link); // To pass to SharePopup if needed
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('https://pixel-classes.onrender.com/api/home/QuePdf/Subject_Pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ course_name: "B.C.A", sub: subject })
                });
                if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error("API did not return an array of documents.");

                const dataWithIds = data.map((item, index) => ({ ...item, id: item.id || index }));
                setAllPdfData(dataWithIds);

                const sizes = {};
                await Promise.all(dataWithIds.map(async (pdf) => {
                    if (pdf.pdf) {
                        try {
                            const response = await fetch(pdf.pdf, { method: 'HEAD' });
                            const size = response.headers.get('Content-Length');
                            sizes[pdf.pdf] = size ? (parseInt(size) / 1024).toFixed(2) + ' KB' : 'Size N/A';
                        } catch (headError) {
                            sizes[pdf.pdf] = 'N/A';
                        }
                    }
                }));
                setPdfSizes(sizes);
            } catch (e) {
                setError(e.message || "Could not load documents. The server might be offline.");
                setAllPdfData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [subject]);

    const filteredPdfs = useMemo(() =>
        activeOption.toLowerCase() === 'all'
            ? allPdfData
            : allPdfData.filter(pdf => (pdf.Type || pdf.choose || '').trim().toLowerCase() === activeOption.trim().toLowerCase()),
        [allPdfData, activeOption]
    );

    const getCategoryCounts = useMemo(() => {
        const counts = {};
        menuOptions.forEach(opt => counts[opt.key] = 0);
        allPdfData.forEach(pdf => {
            const type = (pdf.Type || pdf.choose || '').trim().toLowerCase();
            if (counts[type] !== undefined) counts[type]++;
        });
        counts['all'] = allPdfData.length;
        return counts;
    }, [allPdfData]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="ccf mesh_ns min-h-screen text-white flex flex-col">
            <Navbar />
            <div className="flex-1 w-full px-4 sm:px-6 md:px-10 py-4 max-w-6xl mx-auto">
                <header className="mt-10 mb-8 text-center">
                    <h2 className="text-lg sm:text-xl font-light opacity-80">Semester {sem}</h2>
                    <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mt-1">{subject}</h1>
                </header>

                <nav className="mb-8 sticky top-[70px] z-30 bg-black/30 backdrop-blur-lg py-2 rounded-xl">
                    <div className="flex overflow-x-auto space-x-2 sm:space-x-4 no-scrollbar px-4">
                        {menuOptions.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => setActiveOption(option.key)}
                                className="relative px-4 py-2 text-sm sm:text-base font-semibold transition-colors duration-300 whitespace-nowrap rounded-lg text-white/70 hover:text-white"
                            >
                                {activeOption === option.key && (
                                    <motion.div layoutId="activePill" className="absolute inset-0 bg-white/10 rounded-lg" transition={{ type: 'spring', duration: 0.6 }} />
                                )}
                                <span className="relative z-10">{option.label} ({getCategoryCounts[option.key] || 0})</span>
                            </button>
                        ))}
                    </div>
                </nav>

                {/* MAIN CONTENT - REWRITTEN WITH CONDITIONAL LOGIC */}
                <main>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeOption}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {loading ? (
                                <motion.ul className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
                                    {Array.from({ length: 5 }).map((_, i) => <motion.li key={i} variants={itemVariants}><LoadingSkeleton /></motion.li>)}
                                </motion.ul>
                            ) : error ? (
                                <ErrorState error={error} />
                            ) : filteredPdfs.length > 0 ? (
                                <motion.ul className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
                                    {filteredPdfs.map((pdf) => (
                                        <motion.li key={pdf.id} variants={itemVariants}>
                                            {['assignment', 'imp'].includes((pdf.Type || pdf.choose || '').trim().toLowerCase()) ? (
                                                // --- Card Variant 1: For Assignments & IMP Q&A (Full card is a link) ---
                                                <div
                                                    onClick={() => handleopen(pdf.id, pdfSizes[pdf.pdf], pdf.pdf, pdf.name, pdf.year)}
                                                    className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                                                >
                                                    <div className="flex-shrink-0 text-3xl">📄</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base sm:text-lg font-semibold truncate text-white" title={pdf.name}>{pdf.name || pdf.title}</p>
                                                        <p className="text-xs sm:text-sm text-white/50">
                                                            {pdfSizes[pdf.pdf] || "..."} • PDF • {pdf.year || 2025}
                                                            {pdf.choose && ` • ${pdf.choose}`}
                                                        </p>
                                                    </div>
                                                    <div className="p-2 rounded-full bg-white/5 text-white/70">
                                                        <span className="material-symbols-outlined">open_in_new</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                // --- Card Variant 2: For Notes, Papers, etc. (Separate actions) ---
                                                <div className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                                                    <div className="flex-shrink-0 text-3xl">📄</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base sm:text-lg font-semibold truncate text-white" title={pdf.name}>{pdf.name || pdf.title}</p>
                                                        <p className="text-xs sm:text-sm text-white/50">
                                                            {pdfSizes[pdf.pdf] || "..."} • PDF • {pdf.year || 2025}
                                                            {pdf.choose && ` • ${pdf.choose}`}
                                                        </p>
                                                    </div>
                                                    {/* --- Redesigned Buttons with Tooltips --- */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative group">
                                                            <button
                                                                onClick={() => handleDownload(pdf.pdf, pdf.name, pdf.id, subject)}
                                                                className="p-3 rounded-full bg-white/5 text-white/70 hover:bg-blue-500/50 hover:text-white transition-colors duration-200"
                                                            >
                                                                <span className="material-symbols-outlined">
                                                                    {loadingStates[pdf.id] ? "progress_activity" : downloadStates[pdf.id] || "download"}
                                                                </span>
                                                            </button>
                                                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 text-sm text-white bg-gray-900/80 border border-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                                Download
                                                            </span>
                                                        </div>
                                                        <div className="relative group">
                                                            <button
                                                                onClick={() => openShareModal(pdf)}
                                                                className="p-3 rounded-full bg-white/5 text-white/70 hover:bg-green-500/50 hover:text-white transition-colors duration-200"
                                                            >
                                                                <span className="material-symbols-outlined">share</span>
                                                            </button>
                                                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 text-sm text-white bg-gray-900/80 border border-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                                Share
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            ) : (
                                <EmptyState category={activeOption} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* --- FIXED: SHARE MODAL --- */}
            <AnimatePresence>
                {shareModal.isOpen && shareModal.pdf && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900/70 border border-white/20 text-white p-6 rounded-2xl relative max-w-md w-full">
                            <button onClick={() => setShareModal({ isOpen: false, pdf: null })} className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors">&times;</button>
                            <h2 className="text-xl font-semibold mb-4">Share "{shareModal.pdf.name}"</h2>
                            <div className="mb-4 flex justify-center"><img src={generateQrCodeURL(getShareLink(shareModal.pdf.pdf))} alt="QR Code" className="w-32 h-32 bg-white p-1 rounded-md" /></div>
                            <input type="text" readOnly value={getShareLink(shareModal.pdf.pdf)} className="w-full bg-white/10 p-2 border border-white/20 rounded-md mb-4" />
                            <div className="flex gap-2 mb-4">
                                <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition-colors" onClick={handleCopyLink}>Copy Link</button>
                                <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md transition-colors" onClick={() => setShowShareChatPopup(true)}>Share to Chat</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showShareChatPopup && (<SharePopup messageToShare={shareMessage} onClose={() => setShowShareChatPopup(false)} />)}

            {/* --- FIXED: UPLOAD MODAL --- */}
            <AnimatePresence>
                {isUploadOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex text-white items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900/70 border border-white/20 p-6 rounded-2xl relative w-full max-w-md">
                            <button onClick={() => setIsUploadOpen(false)} disabled={isUploading} className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors">&times;</button>
                            <h2 className="text-2xl font-bold">Upload Document</h2>
                            <p className='text-white/50 mb-4'>for {subject} - Semester {sem}</p>


                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(choose).then(() => setIsUploadOpen(false)); }}>
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    value={subject}
                                    onChange={(e) => setSub(e.target.value)}
                                    className="w-full p-3 border border-white/20 text-white bg-white/5 rounded-lg mb-4"
                                />

                                <input
                                    type="text"
                                    placeholder="Semester"
                                    value={sem}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="w-full p-3 border border-white/20 text-white bg-white/5 rounded-lg mb-4"
                                />




                                <select value={choise} required onChange={(e) => setChoise(e.target.value)} className="w-full p-3 border border-white/20 text-white bg-white/5 rounded-lg mb-4 appearance-none">
                                    <option value="" className='text-white bg-black ' disabled>-- Select Category --</option>
                                    {uploadOptions.map(opt => (<option className='text-white bg-black ' key={opt.key} value={opt.key}>{opt.label}</option>))}
                                </select>


                                <textarea className="w-full p-3 border border-white/20 text-white bg-white/5 rounded-lg mb-4" rows="4" placeholder='Description or Title (e.g., Module 1 Notes)' value={content} onChange={(e) => setContent(e.target.value)} required />

                                <input type="file" multiple onChange={handleFileChange} className="w-full p-2 border border-white/20 text-white bg-white/5 rounded-lg mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />


                                <button type="submit" disabled={isUploading} className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors disabled:bg-gray-500">
                                    {isUploading ? "Uploading..." : "Submit"}
                                </button>


                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* UPLOAD FAB */}
            <AnimatePresence>
                {uploadOptions.some(opt => opt.key === activeOption) && (
                    <motion.button initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 50 }}
                        onClick={() => setIsUploadOpen(true)}
                        className="fixed bottom-24 right-8 w-16 h-16 bg-gradient-to-br from-blue-500/80 to-indigo-600/80 border border-blue-500/30 rounded-full flex items-center justify-center text-white shadow-lg"
                    >
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </motion.button>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default SubjectPage;