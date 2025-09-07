// hooks/useDownloadHandler.js
import { useState } from 'react';

export default function useDownloadHandler() {
    const [downloadStates, setDownloadStates] = useState({});
    const [loadingStates, setLoadingStates] = useState({});

    const handleDownload = async (pdfUrl, pdfName, pdfId, sub) => {
        const getHistory = () => {
            try {
                return JSON.parse(localStorage.getItem('downloadHistory')) || [];
            } catch {
                return [];
            }
        };

        const saveHistory = (history) => {
            localStorage.setItem('downloadHistory', JSON.stringify(history.slice(0, 50)));
        };

        setLoadingStates(prev => ({ ...prev, [pdfId]: true }));
        setDownloadStates(prev => ({ ...prev, [pdfId]: 'downloading' }));

        try {
            const res = await fetch(pdfUrl);
            const buffer = await res.arrayBuffer();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });

            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${pdfName}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(a.href);

            setDownloadStates(prev => ({ ...prev, [pdfId]: 'done' }));
            const history = getHistory();
            history.unshift({ pdfName, pdfUrl, sub ,downloadDate: new Date().toISOString() });
            saveHistory(history);
        } catch (err) {
            console.error("Download failed:", err);
            setDownloadStates(prev => ({ ...prev, [pdfId]: 'error' }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [pdfId]: false }));
        }
    };

    return { handleDownload, downloadStates, loadingStates };
}
