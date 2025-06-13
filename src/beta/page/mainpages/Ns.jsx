import React, { useEffect, useState } from 'react';
import '../../new.css';
import Cookies from "js-cookie";
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';

const Ns = () => {
    const sem = Cookies.get("latest_sem");
    const Subject = Cookies.get("sub");
    const choose = Cookies.get("choose");

    const [loading, setLoading] = useState(false);
    const [downloadStates, setDownloadStates] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [pdfData, setPdfData] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});



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



  const handleDownload = async (pdfUrl, pdfName, pdfId) => {
    // Helper function to get download history from Local Storage
    const getDownloadHistory = () => {
        try {
            const historyString = localStorage.getItem('downloadHistory');
            return historyString ? JSON.parse(historyString) : [];
        } catch (error) {
            console.error("Error parsing download history from Local Storage:", error);
            return [];
        }
    };

    // Helper function to save download history to Local Storage
    const saveDownloadHistory = (history) => {
        try {
            // Optional: Limit the number of items to prevent Local Storage from growing too large
            const MAX_HISTORY_ITEMS = 50; // Adjust this number as needed
            if (history.length > MAX_HISTORY_ITEMS) {
                history = history.slice(0, MAX_HISTORY_ITEMS); // Keep only the most recent items
            }
            localStorage.setItem('downloadHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Error saving download history to Local Storage:", error);
        }
    };

    setLoadingStates(prevStates => ({ ...prevStates, [pdfId]: true }));
    setDownloadStates(prevStates => ({ ...prevStates, [pdfId]: 'downloading' }));

    try {
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer(); // Get as ArrayBuffer

        // Create a Blob with a generic MIME type to encourage download
        const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = `${pdfName}.pdf` || "download.pdf"; // Ensure a .pdf extension
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        // Clean up the object URL
        URL.revokeObjectURL(anchor.href);

        setDownloadStates(prevStates => ({ ...prevStates, [pdfId]: 'download_done' }));

        // --- Store download details in Local Storage ---
        const history = getDownloadHistory();
        const newDownload = {
            pdfName: pdfName,
            pdfUrl: pdfUrl,
            downloadDate: new Date().toISOString() // Store date and time in ISO format
        };
        history.unshift(newDownload); // Add new item to the beginning (most recent first)
        saveDownloadHistory(history);
        // --- End Local Storage logic ---

    } catch (error) {
        console.error("Download failed:", error);
        setDownloadStates(prevStates => ({ ...prevStates, [pdfId]: 'error' }));
    } finally {
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


                <div className='grid gap-2 nd:grid-cols-1  lg:grid-cols-3 w-full text-white p-6 '>
                    {loading ? <div className="flex gap-2 max-w-[100vw] text-white items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-60 hover:border-green-600 hover:shadow-lg hover:bg-blue-800/30 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:0px_1px_8px_rgba(13,34,71,0.12),_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px]">

                        <img
                            src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                            alt="PDF Icon"
                            className="w-12 h-12 object-contain"
                        />
                        <div className='flex-1 flex flex-col'>
                            <p className='flex-1 text-xl'>loading...</p>
                            <div className='flex gap-2 '>

                                <div className='py-1 px-2 bg-blue-600/30 border border-blue-900 rounded-xl '><span className='text-xs text-gray-300'>Size:</span> <span className='text-sm '>loading...</span></div>
                                <div className='py-1 px-2 bg-blue-600/30 border border-blue-900 rounded-xl '><span className='text-xs text-gray-300'>type:</span> <span className='text-sm '>loading...</span></div>
                                <div className='py-1 px-2 bg-blue-600/30 border border-blue-900 rounded-xl '><span className='text-xs text-gray-300'>Year:</span> <span className='text-sm '> loading...</span></div>
                            </div>

                        </div>
                        <div className="group relative mr-31">
                            <button>
                                <span className="material-symbols-outlined"> arrow_circle_down
                                </span>
                            </button>
                        </div>

                    </div> :

                        pdfData.length > 0 ? (
                            pdfData
                                .filter(pdf => pdf.choose === choose)
                                .map((pdf, index) => (
                                    <div onClick={() => handleDownload(pdf.pdf, pdf.name, pdf.id)} key={index} className="flex gap-2 max-w-[100vw] text-white items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-60 hover:border-green-600 hover:shadow-lg hover:bg-blue-800/30 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:0px_1px_8px_rgba(13,34,71,0.12),_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px]">

                                        <img
                                            src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                                            alt="PDF Icon"
                                            className="w-12 h-12 object-contain"
                                        />
                                        <div className='flex-1 flex flex-col'>
                                            <p className='flex-1 text-xl'>{pdf.name}</p>
                                            <div className='flex gap-2 '>

                                                <div className='py-1 px-2 bg-blue-600/30 border border-blue-900 rounded-xl '><span className='text-xs text-gray-300'>Size:</span> <span className='text-xs '> {pdfSizes[pdf.pdf] || "N/A"}</span></div>
                                                <div className='py-1 px-2 bg-blue-600/30 border border-blue-900 rounded-xl '><span className='text-xs text-gray-300'>type:</span> <span className='text-xs '> PDF</span></div>
                                                <div className='py-1 px-2 bg-blue-600/30 border border-blue-900 rounded-xl '><span className='text-xs text-gray-300'>Year:</span> <span className='text-xs '> {pdf.year}</span></div>
                                            </div>

                                        </div>
                                        <div onClick={() => handleDownload(pdf.pdf, pdf.name, pdf.id)} className="group relative mr-31">
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
