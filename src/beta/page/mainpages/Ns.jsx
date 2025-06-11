import React, { useEffect, useState } from 'react';
import '../../new.css';
import Cookies from "js-cookie";
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';

const Ns = () => {
    const sem = Cookies.get("latest_sem");
    const Subject = Cookies.get("sub");
    const choose = Cookies.get("choose");

    const [loading, setLoading] =useState(false);
    const [downloadStates, setDownloadStates] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
    const [pdfData, setPdfData] = useState([]);



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
          console.log('Success:', data);
          setPdfData(data); 
          setLoading(false); 
        })
        .catch((error) => {
          console.error('Error:', error);
          setLoading(false); // Set loading to false in case of error
        });
    }
  }, []);
  const handleDownload = async (pdfUrl, pdfName, pdfId) => {
    // Set loading state for the specific PDF
    setLoadingStates(prevStates => ({ ...prevStates, [pdfId]: true }));
    setDownloadStates(prevStates => ({ ...prevStates, [pdfId]: 'downloading' }));

    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob);
      anchor.download = pdfName || "download";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Set download status to done for the specific PDF
      setDownloadStates(prevStates => ({ ...prevStates, [pdfId]: 'download_done' }));
    } catch (error) {
      console.error("Download failed:", error);
      // Set download status to failed for the specific PDF
      setDownloadStates(prevStates => ({ ...prevStates, [pdfId]: 'error' }));
    } finally {
      // Always set loading to false for the specific PDF
      setLoadingStates(prevStates => ({ ...prevStates, [pdfId]: false }));
    }
  };

    return (
        <>
            <div className='mesh_ns h-screen Mont overflow-y-scroll '>
                <Navbar />
                <div className='mont'>
                    <div className='p-4 py-16 flex flex-col text-center content-center flex-nowrap justify-center gap-3 items-center'>
                        <div>
                            <span className='text-center m-3 text-3xl md:text-lg lg:text-3xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent Mont '>Dowmload Free {choose}?</span>
                        </div>
                        <div>
                            <span className='text-center text-md my-3 text-gray-300 font-medium'>for {Subject},({sem})</span>
                        </div>
                    </div>
                </div>


                <div className='flex gap-2 text-white p-6 '>
                        {loading ? "Loading..." : 
                        
                       pdfData.length > 0 ? (
  pdfData
   .filter(pdf => pdf.choose === choose)    
  .map((pdf, index) => (
    <div key={index} className="flex gap-2 max-w-[100vw] text-white items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-60 hover:border-green-600 hover:shadow-lg hover:bg-blue-800/30 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:0px_1px_8px_rgba(13,34,71,0.12),_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px]">

                      <img
                        src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                        alt="PDF Icon"
                        className="w-12 h-12 object-contain"
                      />
                      <div className='flex-1 flex flex-col'>
<p className='flex-1 text-xl'>{pdf.name}</p>
<div className='flex gap-2 '>

<div className='py-1 px-2 bg-blue-600/30 border border-blue-900 rounded-xl '><span className='text-xs text-gray-300'>Size:</span> <span className='text-sm '> N/A</span></div>
<div className='py-1 px-2 bg-blue-600/30 border border-blue-900 rounded-xl '><span className='text-xs text-gray-300'>type:</span> <span className='text-sm '> PDF</span></div>
<div className='py-1 px-2 bg-blue-600/30 border border-blue-900 rounded-xl '><span className='text-xs text-gray-300'>Year:</span> <span className='text-sm '> {pdf.year}</span></div>
</div>

                      </div>
  <div onClick={() => handleDownload(pdf.pdf, pdf.name,pdf.id)} class="group relative mr-31">
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

                        
                        }
                </div>

            </div>
            <Footer />
        </>
    )
}

export default Ns
