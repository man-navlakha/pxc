import React, { useState } from 'react';
import '../../new.css';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';
import SharePopup from '../../componet/SharePopup';

// Custom Hooks
import useFetchPdfData from '../../hooks/useFetchPdfData';
import useDownloadHandler from '../../hooks/useDownloadHandler';
import useShareHandler from '../../hooks/useShareHandler';
import useFileUploadHandler from '../../hooks/useFileUploadHandler';
import useHandleQueryParams from '../../hooks/useHandleQueryParams';

const Ns = () => {
  const sem = Cookies.get('latest_sem');
  const paramSub = Cookies.get('sub');
  const paramChoose = Cookies.get('choose');

  const { osubject, ochoose } = useParams();
  const Subject = osubject || paramSub;
  const choose = ochoose || paramChoose;

  const navigate = useNavigate();
  const [isopen, setIsopen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Hooks
  const { pdfData, pdfSizes, loading } = useFetchPdfData(Subject);
  const { handleDownload, downloadStates, loadingStates } = useDownloadHandler();
  const {
    shareModal, setShareModal, shareMessage,
    setShareMessage, openShareModal, getShareLink, generateQrCodeURL
  } = useShareHandler();
  const {
    files, content, setContent, handleFileChange,
    handleSubmit, isUploading
  } = useFileUploadHandler();

  // Query Param Redirect
  useHandleQueryParams();

  // Redirect if category is imp/assignment
  React.useEffect(() => {
    if (["Assignment", "imp"].includes(choose)) {
      navigate(`/nss/${Subject}/${choose}`);
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

      {/* Upload Floating Button */}
      <div
        role="button"
        onClick={() => setIsopen(true)}
        className="border border-gray-700 fixed bottom-[6rem] right-5 rounded-[50%] flex justify-center items-center text-3xl w-16 h-16 bg-gradient-to-br from-[#27272a] via-[#52525b] to-[#a1a1aa] text-white font-black"
      >
        <div className="flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-700">+</div>
      </div>

      {/* Upload Modal */}
      {isopen && (
        <div className="z-50 loveff flex justify-center items-center inset-0 fixed bg-black p-4 bg-opacity-50">
          <div className="flex flex-col border-2 border-white p-6 rounded-lg shadow-lg relative bg-gradient-to-br from-[#1d4ed8] via-[#1e40af] to-[#111827]">
            <button
              onClick={() => setIsopen(false)}
              className="absolute top-2 right-4 text-3xl text-red-500 hover:text-red-200"
              disabled={isUploading}
            >
              x
            </button>
            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-white via-stone-400 to-neutral-300">Add your Notes</h2>
            <p className='text-gray-400 mb-4'>for {Subject} - Semester {sem}</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
              setIsopen(false);
            }}>
              <textarea
                className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg mb-4"
                rows="4"
                placeholder='Description'
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
              <button
                type="submit"
                disabled={isUploading}
                className="smky-btn3 relative text-white py-2 px-6 transition-all duration-500 overflow-hidden z-20 after:absolute after:h-1 after:hover:h-[200%] after:bg-[#abd373] after:rounded-t-full after:w-full after:bottom-0 after:left-0"
              >
                {isUploading ? <div className="s-loading"></div> : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Ns;
