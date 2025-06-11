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
const handleDownload = async (url, fileName) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = fileName || "download";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch (error) {
    console.error("Download failed:", error);
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
    <div key={index} className="flex gap-2 max-w-[100vw] text-white items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:0px_1px_8px_rgba(13,34,71,0.12),_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px]">

                      <img
                        src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                        alt="PDF Icon"
                        className="w-12 h-12 object-contain"
                      />
      <p className='flex-1'>{pdf.name}</p>
  <div onClick={() => handleDownload(pdf.pdf, pdf.name)} class="group relative mr-31">
    <button>
      <span class="material-symbols-outlined">download</span>
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
