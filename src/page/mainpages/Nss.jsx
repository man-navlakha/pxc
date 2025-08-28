import React, { useEffect, useState } from 'react';
import '../../new.css';
import Cookies from "js-cookie";
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';
import { Navigate, useNavigate, useParams} from 'react-router-dom';

const Ns = () => {
    const { osubject, ochoose } = useParams();
    const sem = Cookies.get("latest_sem");
    const sub = Cookies.get("sub");
    const option = Cookies.get("choose");

       const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [downloadStates, setDownloadStates] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [pdfData, setPdfData] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});


    const Subject = (osubject || sub)
    const choose = (ochoose || option)


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
                    setPdfData(data);
                    data.forEach(pdf => {
                        if (pdf.pdf) {
                            fetchPdfSize(pdf.pdf);
                        }
                    });
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setLoading(false); // Set loading to false in case of error
                });
        }
    }, []);


    const fetchPdfSize = async (url) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentLength = response.headers.get('Content-Length');
            if (contentLength) {
                setPdfSizes(prevSizes => ({
                    ...prevSizes,
                    [url]: (contentLength / 1024).toFixed(2) + ' KB' // Convert bytes to KB
                }));
            }
          
        } catch (error) {
            console.error('Error fetching PDF size:', error);
        }
    };



  const handleDownload = async (pdfId, pdfSizes, pdfurl, pdfname, pdfyear) => {
      Cookies.set("pdfid" , pdfId)
      Cookies.set("pdfSizes" , pdfSizes)
      Cookies.set("pdfurl" , pdfurl)
      Cookies.set("pdfname" , pdfname)
      Cookies.set("pdfyear" , pdfyear)
      navigate(`/select`)
};
    return (
        <>
            <div className='mesh_ns h-screen ccf overflow-y-scroll '>
                <Navbar />
                <div className='ccf'>
                    <div className='p-4 py-16 flex flex-col text-center content-center flex-nowrap justify-center gap-3 items-center'>
                        <div>
                            <span className='text-center m-3 text-3xl md:text-lg lg:text-5xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent ccf '>Dowmload Free {choose}?</span>
                        </div>
                        <div>
                            <span className='text-center text-xl md:text-xl lg:text-2xl my-3 text-gray-300 font-medium'>for {Subject},({sem})</span>
                        </div>
                    </div>
                </div>


                <div className='grid gap-2 nd:grid-cols-1  lg:grid-cols-3 w-full text-white p-6 '>
                   {loading ?
                        <>
      <div className="flex justify-center items-center col-span-3">
                            <div className=" border-t-2 rounded-full border-green-500 bg-gray-900 animate-spin
aspect-square w-8 flex justify-center items-center text-yellow-700"></div>
                        </div>


                        </>
                        :

                        pdfData.length > 0 ? (
                            pdfData
                                .filter(pdf => pdf.choose === choose)
                                .map((pdf, index) => (
                                    <div onClick={() => handleDownload(pdf.id, pdfSizes[pdf.pdf], pdf.pdf, pdf.name, pdf.year)} key={index} className="flex gap-2 max-w-[100vw] text-white items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-60  hover:shadow-lg hover:bg-blue-800/30 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:0px_1px_8px_rgba(13,34,71,0.12),_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px]">

                                        <img
                                            src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                                            alt="PDF Icon"
                                            className="w-12 h-12 object-contain"
                                        />
                                        <div className='flex-1 flex flex-col'>
                                            <p className='flex-1 text-xl'>{pdf.name}</p>
                                            <div className='flex gap-2 '>
<p className="text-md text-slate-400">
                                                    {pdfSizes[pdf.pdf] || "Loading..."} • PDF • {2025}
                                                </p>
                                                 </div>

                                        </div>
                                        <div onClick={() => handleDownload(pdf.id, pdfSizes[pdf.pdf], pdf.pdf, pdf.name, pdf.year)} className="group relative mr-31">
                                            <button>
                                                <span className="material-symbols-outlined">
                                                    open_in_new
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
