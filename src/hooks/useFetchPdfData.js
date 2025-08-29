// hooks/useFetchPdfData.js
import { useEffect, useState } from 'react';

export default function useFetchPdfData(subject) {
    const [pdfData, setPdfData] = useState([]);
    const [pdfSizes, setPdfSizes] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!subject) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('https://pixel-classes.onrender.com/api/home/QuePdf/Subject_Pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ course_name: "B.C.A", sub: subject })
                });

                const data = await res.json();
                setPdfData(data);

                const sizes = {};
                await Promise.all(data.map(async (pdf) => {
                    if (pdf.pdf) {
                        const response = await fetch(pdf.pdf, { method: 'HEAD' });
                        const size = response.headers.get('Content-Length');
                        if (size) sizes[pdf.pdf] = (size / 1024).toFixed(2) + ' KB';
                    }
                }));
                setPdfSizes(sizes);
            } catch (e) {
                console.error("Error fetching PDF data:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subject]);

    return { pdfData, pdfSizes, loading };
}
