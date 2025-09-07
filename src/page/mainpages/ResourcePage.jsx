// /pages/ResourcePage.js

import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';
import '../../new.css';

// --- SUB-COMPONENT 1: The List View ---
const QuestionListView = ({ loading, list, sizes, choose, onSelectQuestion }) => (
    <>
        <div className="ccf">
            <div className="p-4 py-16 text-center">
                <h1 className="text-3xl lg:text-5xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent">
                    Download Free {choose}
                </h1>
            </div>
        </div>
        <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-3 w-full text-white p-6">
            {loading ? (
                <div className="flex justify-center items-center col-span-3"><div className="border-t-2 rounded-full border-green-500 animate-spin w-8 h-8" /></div>
            ) : (
                list.filter(pdf => pdf.choose === choose).map((pdf) => (
                    <div key={pdf.id} onClick={() => onSelectQuestion(pdf)} className="flex cursor-pointer gap-2 items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900/60 hover:bg-blue-800/30 transition-all">
                        <img src="https://www.freeiconspng.com/uploads/pdf-icon-9.png" alt="PDF Icon" className="w-12 h-12 object-contain" />
                        <div className="flex-1 flex flex-col min-w-0">
                            <p className="text-xl truncate" title={pdf.name}>{pdf.name}</p>
                            <p className="text-md text-slate-400">{sizes[pdf.pdf] || "..."} • PDF • {pdf.year || 2025}</p>
                        </div>
                        <span className="material-symbols-outlined">open_in_new</span>
                    </div>
                ))
            )}
        </div>
    </>
);

// --- SUB-COMPONENT 2: The Detail View ---
const DetailView = ({ question, answers, sizes, choose, loadingStates, downloadStates, onDownload, onOpenUploadModal }) => {
    if (!question) {
        return <div className="text-center p-10">Loading document details...</div>;
    }
    return (
        <>
            <div className='py-16 text-center '><h1 className='text-3xl lg:text-3xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent'>{question.name}</h1></div>
            <div className='mx-6'>
                <div onClick={() => onDownload(question.pdf, question.name, question.id)} className="flex gap-2 text-white items-center px-6 p-4 justify-center rounded-2xl border border-gray-200/50 bg-gray-600/30 hover:bg-blue-500/20 cursor-pointer">
                    <img src="https://www.freeiconspng.com/uploads/pdf-icon-9.png" alt="PDF Icon" className="w-12 h-12" />
                    <div className='flex-1 ml-2'>
                        <p className='text-lg mb-2'>{question.name}</p>
                        <p className="text-sm text-slate-400">{sizes[question.pdf] || "..."} • PDF • {question.year}</p>
                    </div>
                    <span className="material-symbols-outlined">{loadingStates[question.id] ? 'arrow_circle_down' : (downloadStates[question.id] || 'download')}</span>
                </div>
            </div>
            {['Imp', 'Assignment'].includes(choose) && (
                <>
                    <div className='mx-6 font-bold text-white py-4'><span>Answers for {question.name}</span></div>
                    <div className='grid gap-2 lg:grid-cols-3 w-full text-white px-6 mb-6'>
                        {answers.length > 0 ? answers.map((answer) => (
                            <div key={answer.id} onClick={() => onDownload(answer.pdf, `Answer by ${answer.name}`, answer.id)} className="flex gap-2 items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900/30 hover:bg-blue-800/30 cursor-pointer">
                                <img src="https://www.freeiconspng.com/uploads/pdf-icon-9.png" alt="PDF Icon" className="w-12 h-12" />
                                <div className='flex-1 min-w-0'>
                                    <p className='text-xl truncate'>{answer.contant}</p>
                                    <p className="text-md text-slate-400">{sizes[answer.pdf] || "..."} • By @{answer.name}</p>
                                </div>
                                <span className="material-symbols-outlined">{loadingStates[answer.id] ? 'arrow_circle_down' : (downloadStates[answer.id] || 'download')}</span>
                            </div>
                        )) : <p className="col-span-3 text-center text-white/60">No answers uploaded yet.</p>}
                    </div>
                    <div role="button" onClick={onOpenUploadModal} className="border border-gray-700 fixed bottom-[6rem] right-5 rounded-full flex justify-center items-center w-16 h-16 bg-gradient-to-br from-[#27272a] to-[#a1a1aa] cursor-pointer">
                        <span className="material-symbols-outlined font-black text-4xl bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-700">add</span>
                    </div>
                </>
            )}
        </>
    );
};

// --- SUB-COMPONENT 3: The Upload Modal ---
const UploadModal = ({ isOpen, isUploading, questionName, onClose, onSubmit, onContentChange, onFileChange }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed ccf inset-0 z-50 flex justify-center items-center bg-black/50 p-4">
            <div className="relative flex flex-col p-6 rounded-lg border-2 border-white shadow-lg bg-gradient-to-br from-[#1d4ed8] to-[#111827]">
                <button disabled={isUploading} onClick={onClose} className="absolute top-2 right-4 text-3xl text-red-500 hover:text-red-200">&times;</button>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-white to-neutral-300 text-center">Add your Answer</h2>
                <p className='text-gray-400 text-center'>for {questionName}</p>
                <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
                    <textarea rows="4" placeholder='Description' className="w-full p-2 rounded-lg border bg-[#383838] text-gray-100" onChange={onContentChange} required />
                    <input type="file" multiple className="w-full p-2 rounded-lg border bg-[#383838] text-gray-100" onChange={onFileChange} />
                    <button type="submit" disabled={isUploading} className="smky-btn3 relative text-white py-2 px-6 after:absolute after:h-1 after:hover:h-[200%] transition-all duration-500 after:bg-[#abd373] after:rounded-t-full after:w-full after:bottom-0 after:left-0">{isUploading ? <div className="s-loading"></div> : "Submit"}</button>
                </form>
            </div>
        </div>
    );
};

// --- PARENT COMPONENT: The Main Page Logic ---
const ResourcePage = () => {
    // --- State and URL Hooks ---
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    
    const [loading, setLoading] = useState(false);
    const [questionList, setQuestionList] = useState([]);
    const [answerList, setAnswerList] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [downloadStates, setDownloadStates] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadContent, setUploadContent] = useState("");
    const [uploadFiles, setUploadFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const subject = params.get('sub');
    const choose = params.get('choose');
    const questionId = params.get('id');

    // --- Data Fetching Effects ---
    useEffect(() => {
        if (subject) {
            setLoading(true);
            fetch(`https://pixel-classes.onrender.com/api/home/QuePdf/Subject_Pdf`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course_name: "B.C.A", sub: subject })})
            .then(res => res.json()).then(data => { setQuestionList(data); data.forEach(pdf => pdf.pdf && fetchPdfSize(pdf.pdf)); }).catch(console.error).finally(() => setLoading(false));
        }
    }, [subject]);

    useEffect(() => {
        if (questionId && questionList.length > 0) {
            const foundPdf = questionList.find(pdf => pdf.id == questionId);
            setSelectedPdf(foundPdf);
            if (foundPdf?.pdf && !pdfSizes[foundPdf.pdf]) fetchPdfSize(foundPdf.pdf, true);
            if (['Imp', 'Assignment'].includes(choose)) {
                fetch(`https://pixel-classes.onrender.com/api/home/AnsPdf/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: questionId })})
                .then(res => res.json()).then(data => { setAnswerList(data); data.forEach(pdf => pdf.pdf && fetchPdfSize(pdf.pdf, true)); }).catch(console.error);
            } else { setAnswerList([]); }
        }
    }, [questionId, questionList, choose]);

    // --- Handlers and Utility Functions ---
    const fetchPdfSize = async (url, inMB = false) => {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            const len = res.headers.get('Content-Length');
            if (len) setPdfSizes(p => ({ ...p, [url]: inMB ? `${(len / 1048576).toFixed(2)} MB` : `${(len / 1024).toFixed(2)} KB` }));
        } catch (error) { console.error('Error fetching PDF size:', error); }
    };

    const handleSelectQuestion = useCallback((pdf) => navigate(`${location.pathname}?sub=${subject}&choose=${choose}&id=${pdf.id}`), [navigate, location.pathname, subject, choose]);

    const handleDownload = async (pdfUrl, pdfName, pdfId) => {
        if (!pdfUrl) return;
        setLoadingStates(p => ({ ...p, [pdfId]: true })); setDownloadStates(p => ({ ...p, [pdfId]: 'downloading' }));
        try {
            const res = await fetch(pdfUrl); const blob = new Blob([await res.arrayBuffer()]);
            const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${pdfName}.pdf`;
            a.click(); URL.revokeObjectURL(a.href); a.remove();
            setDownloadStates(p => ({ ...p, [pdfId]: 'download_done' }));
        } catch (err) { setDownloadStates(p => ({ ...p, [pdfId]: 'error' })); } finally { setLoadingStates(p => ({ ...p, [pdfId]: false })); }
    };

    const handleSubmitAnswer = async (e) => {
        e.preventDefault(); if (!uploadContent.trim() || uploadFiles.length === 0) return; setIsUploading(true);
        const fd = new FormData(); fd.append("name", "GuestUser"); fd.append("content", uploadContent); fd.append("id", questionId); uploadFiles.forEach(f => fd.append("pdf", f));
        try { await fetch("https://pixel-classes.onrender.com/api/home/upload_pdf/", { method: "POST", body: fd }); setIsUploadModalOpen(false); } catch (err) { alert("Upload Failed"); } finally { setIsUploading(false); }
    };

    // --- Main Render ---
    return (
        <div className='mesh_select min-h-screen ccf overflow-y-scroll'>
            <Navbar />
            <main className='min-h-screen'>
                {questionId ? (
                    <DetailView
                        question={selectedPdf}
                        answers={answerList}
                        sizes={pdfSizes}
                        choose={choose}
                        loadingStates={loadingStates}
                        downloadStates={downloadStates}
                        onDownload={handleDownload}
                        onOpenUploadModal={() => setIsUploadModalOpen(true)}
                    />
                ) : (
                    <QuestionListView
                        loading={loading}
                        list={questionList}
                        sizes={pdfSizes}
                        choose={choose}
                        onSelectQuestion={handleSelectQuestion}
                    />
                )}
            </main>
            <UploadModal
                isOpen={isUploadModalOpen}
                isUploading={isUploading}
                questionName={selectedPdf?.name}
                onClose={() => setIsUploadModalOpen(false)}
                onSubmit={handleSubmitAnswer}
                onContentChange={(e) => setUploadContent(e.target.value)}
                onFileChange={(e) => setUploadFiles(Array.from(e.target.files))}
            />
            <Footer />
        </div>
    );
};

export default ResourcePage;