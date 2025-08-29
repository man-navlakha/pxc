import React, { useEffect, useState, useCallback } from 'react';
import '../../new.css';
import Cookies from "js-cookie";
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';
import { useNavigate, useParams } from 'react-router-dom';

const Nss = () => {
  const { osubject, ochoose } = useParams();
  const sem = Cookies.get("latest_sem");
  const sub = Cookies.get("sub");
  const option = Cookies.get("choose");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [pdfData, setPdfData] = useState([]);
  const [pdfSizes, setPdfSizes] = useState({});

  // Use param or fallback cookie values
  const Subject = osubject || sub;
  const choose = ochoose || option;

  // Fetch PDF list for the subject on mount or Subject change
  useEffect(() => {
    if (!Subject) return;

    setLoading(true);
    fetch('https://pixel-classes.onrender.com/api/home/QuePdf/Subject_Pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_name: "B.C.A", sub: Subject }),
    })
      .then(res => res.json())
      .then(data => {
        setPdfData(data);
        // Fetch sizes for each PDF asynchronously
        data.forEach(pdf => {
          if (pdf.pdf) fetchPdfSize(pdf.pdf);
        });
      })
      .catch(err => console.error('Error fetching PDFs:', err))
      .finally(() => setLoading(false));
  }, [Subject]);

  // Fetch file size from PDF URL using HEAD request
  const fetchPdfSize = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('Content-Length');
      if (contentLength) {
        setPdfSizes(prev => ({
          ...prev,
          [url]: (contentLength / 1024).toFixed(2) + ' KB',
        }));
      }
    } catch (error) {
      console.error('Error fetching PDF size:', error);
    }
  };

  // Download handler (memorized to prevent unnecessary re-renders)
  const handleDownload = useCallback((pdfId, size, url, name, year) => {
    // Save PDF details to cookies
    Cookies.set("pdfid", pdfId);
    Cookies.set("pdfSizes", size);
    Cookies.set("pdfurl", url);
    Cookies.set("pdfname", name);
    Cookies.set("pdfyear", year);

    // Navigate to select page with encoded URL (optional)
    navigate(`/select/${pdfId}`);
  }, [navigate]);

  return (
    <>
      <div className="mesh_ns h-screen ccf overflow-y-scroll">
        <Navbar />
        <div className="ccf">
          <div className="p-4 py-16 flex flex-col text-center content-center justify-center gap-3 items-center">
            <h1 className="text-center m-3 text-3xl md:text-lg lg:text-5xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent ccf">
              Download Free {choose}?
            </h1>
            <p className="text-center text-xl md:text-xl lg:text-2xl my-3 text-gray-300 font-medium">
              for {Subject}, ({sem})
            </p>
          </div>
        </div>

        <div className="grid gap-2 nd:grid-cols-1 lg:grid-cols-3 w-full text-white p-6">
          {loading ? (
            <div className="flex justify-center items-center col-span-3">
              <div
                className="border-t-2 rounded-full border-green-500 bg-gray-900 animate-spin
                  aspect-square w-8 text-yellow-700"
              />
            </div>
          ) : pdfData.length > 0 ? (
            pdfData
              .filter(pdf => pdf.choose === choose)
              .map((pdf, index) => (
                <div
                  key={index}
                  className="flex gap-2 max-w-[100vw] items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-60 hover:shadow-lg hover:bg-blue-800/30 backdrop-saturate-100 backdrop-contrast-100 lg:min-w-[384px]"
                >
                  <img
                    src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                    alt="PDF Icon"
                    className="w-12 h-12 object-contain"
                  />
                  <div className="flex-1 flex flex-col">
                    <p className="text-xl">{pdf.name}</p>
                    <p className="text-md text-slate-400">
                      {pdfSizes[pdf.pdf] || "Loading..."} • PDF • {pdf.year || 2025}
                    </p>
                  </div>
                  <div className="group relative">
                    <button
                      onClick={() =>
                        handleDownload(pdf.id, pdfSizes[pdf.pdf], pdf.pdf, pdf.name, pdf.year)
                      }
                      className="material-symbols-outlined"
                      aria-label={`Download ${pdf.name}`}
                    >
                      open_in_new
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p className="col-span-3 text-center">No files available for this selection.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Nss;
