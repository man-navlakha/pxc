import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import '../../new.css';
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';

const Select = () => {
    const [loading, setLoading] = useState(false);
    const pdfid = Cookies.get("pdfid")
    const pdfsize = Cookies.get("pdfSizes")
    const pdfurl = Cookies.get("pdfurl")
    const pdfname = Cookies.get("pdfname")
    const pdfyear = Cookies.get("pdfyear")
    const sub = Cookies.get("sub")
    const [downloadStates, setDownloadStates] = useState({});
    const [loadingStates, setLoadingStates] = useState({});

    const [isopen, setIsopen] = useState(false);

    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);
    const [pdfData, setPdfData] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});



    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!content.trim()) {
            alert("Title and content are required!");
            return;
        }

        if (files.length === 0) {
            alert("Please select at least one file!");
            return;
        }

        const name = Cookies.get("username");

        if (!pdfid) {
            alert("ID parameter is missing in the URL!");
            return;
        }


        try {
            setLoading(true); // Start loading

            const formData = new FormData();
            formData.append("name", name);
            formData.append("content", content);
            formData.append("id", pdfid);

            // ✅ Append the actual file (not URLs)
            files.forEach((file) => formData.append("pdf", file));

            const response = await fetch(
                "https://pixel-classes.onrender.com/api/home/upload_pdf/",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Success:", data);
            alert("File uploaded successfully!");

            setIsModalOpen(false);
            setTitle("");
            setContent("");
            setFiles([]);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to upload file. Please try again.");
        } finally {
            setLoading(false); // End loading
        }

    }


    useEffect(() => {
        if (pdfid) {
            setLoading(true); // Set loading to true before fetching data
            fetch('https://pixel-classes.onrender.com/api/home/AnsPdf/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: pdfid }),
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
                    [url]: (contentLength / (1024 * 1024)).toFixed(2) + ' MB' // Convert bytes to MB
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
            <div className='mesh_select h-screen ccf overflow-y-scroll '>
                <Navbar />
                <div className='ccf'>
                    <div className='py-16 flex flex-col text-center content-center flex-nowrap justify-center items-center'>
                        <div>
                            <span className='text-center text-3xl md:text-lg lg:text-3xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent ccf '>Get Answer of {pdfname} for free?</span>
                        </div>
                    </div>
                </div>

                <div className='mx-6'>
                    <div onClick={() => handleDownload(pdfurl, pdfname, pdfid)} className="flex gap-2 max-w-[100vw] text-white items-center  px-6 p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-30 hover:shadow-lg hover:bg-blue-500/20 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:0px_1px_8px_rgba(13,34,71,0.12),_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px]">

                        <img
                            src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                            alt="PDF Icon"
                            className="w-12 h-12 object-contain"
                        />
                        <div className='flex-1 flex flex-col ml-2'>
                            <p className='flex-1 text-lg mb-2'>{pdfname}</p>

                            <div className='flex gap-2 '>
                                <p class="text-sm text-slate-400">{pdfsize} • PDF • {pdfyear}</p>
                            </div>
                        </div>
                        <div className="group relative mr-31">
                            <button>
                                <span className="material-symbols-outlined">
                                    {loadingStates[pdfid] ? 'arrow_circle_down' : (downloadStates[pdfid] || 'download')}
                                </span>
                            </button>
                        </div>

                    </div>
                </div>
                <div className='mx-6 font-bold text-white py-4'>
                    <span >Answers of {pdfname}</span>
                </div>
                <div className='grid gap-2 nd:grid-cols-1  lg:grid-cols-3 w-full text-white px-6 mb-6'>
                    {loading ? <div className="flex gap-2 max-w-[100vw] text-white items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-60  hover:shadow-lg hover:bg-blue-800/30 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:0px_1px_8px_rgba(13,34,71,0.12),_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px]">

                        <img
                            src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                            alt="PDF Icon"
                            className="w-12 h-12 object-contain"
                        />
                        <div className='flex-1 flex flex-col'>
                            <p className='flex-1 text-xl'>loading...</p>
                            <div className='flex gap-2 '>
                                <p class="text-sm text-slate-400">{pdfsize} • PDF • {pdfyear}</p>
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
                                .map((pdf, index) => (
                                    <div key={index} onClick={() => handleDownload(pdf.pdf, `Answer of ${pdfname} by ${pdf.name}`, pdf.id)} className="flex gap-2 max-w-[100vw] text-white items-center p-4 justify-between rounded-2xl border border-gray-200/50 bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-30 hover:shadow-lg hover:bg-blue-800/30 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:0px_1px_8px_rgba(13,34,71,0.12),_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px]">

                                        <img
                                            src="https://www.freeiconspng.com/uploads/pdf-icon-9.png"
                                            alt="PDF Icon"
                                            className="w-12 h-12 object-contain"
                                        />
                                        <div className='flex-1 flex flex-col'>
                                            <p className='flex-1 text-xl'>{pdf.contant}</p>
                                            <div className='flex flex-col '>
                                                <p className="text-md text-slate-400">
                                                    {pdfSizes[pdf.pdf] || "Loading..."} • PDF • {pdfyear}
                                                </p>
                                                <p className='flex-1 text-md text-gray-400 pb-1'> @<span className='text-gray-100'>{pdf.name}</span></p>
                                            </div>

                                        </div>
                                        <div className="group relative mr-31">
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
            <div role="button" onClick={() => setIsopen(true)} data-tooltip="Upload" aria-label="Upload" data-tooltip-className="Upload" tabIndex="0" className="border border-gray-700 fixed bottom-16 right-5 rounded-[50%] flex justify-center items-center text-3xl w-16 h-16 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#27272a] via-[#52525b] to-[#a1a1aa] text-white font-black">
                <div className="flex items-center justify-center bg-gradient-to-br from-white via-neutral-200 to-neutral-700 bg-clip-text text-transparent">
                    +
                </div>
            </div>
            {isopen &&
                <div className="z-50 loveff flex justify-center items-center inset-0 fixed bg-black p-4 bg-opacity-50 " >
                    <div className="flex flex-col border-2 border-white p-6 rounded-lg shadow-lg relative bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-[#1d4ed8] via-[#1e40af] to-[#111827] ">
                        <div>
                            <button
                                onClick={() => setIsopen(false)}
                                className="absolute top-2 right-4 text-3xl text-red-500 dark:text-gray-100 hover:text-red-200 dark:hover:text-white "
                            >
                                x
                            </button>
                            <span className="loveff bg-gradient-to-tr from-white via-stone-400  to-neutral-300 bg-clip-text  text-transparent text-center font-black text-2xl mb-2" >Add your Answer PDF</span>
                            <p className='text-gray-400' >for {sub},
                                <br /> in {pdfname}</p>

                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-4 justify-center items-center">
                                <label htmlFor="content"></label>
                                <textarea name="content" id="content"
                                    className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg"
                                    rows="4"
                                    placeholder='Description'
                                    onChange={(e) => setContent(e.target.value)}
                                    required ></textarea>
                                <label htmlFor="files"></label>
                                <input type="file" name="files" id="files "  multiple
                                    onChange={handleFileChange}
                                    className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838]  rounded-lg" />

                                <button type="submit" disabled={loading} className="smky-btn3 relative text-white hover:text-[#778464] py-2 px-6 after:absolute after:h-1 after:hover:h-[200%] transition-all duration-500 hover:transition-all hover:duration-500 after:transition-all after:duration-500 after:hover:transition-all after:hover:duration-500 overflow-hidden z-20 after:z-[-20] after:bg-[#abd373] after:rounded-t-full after:w-full after:bottom-0 after:left-0 text-gray-600"> {loading ? (
                                    <div className="s-loading"></div> // Display s-loading inside the button
                                ) : (
                                    "Submit"
                                )}</button>
                            </div>
                        </form>
                    </div>
                </div>
            }
            <Footer />
        </>
    )
}

export default Select
