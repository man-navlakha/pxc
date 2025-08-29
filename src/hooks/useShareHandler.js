// hooks/useShareHandler.js
import { useState } from 'react';

export default function useShareHandler() {
    const [shareModal, setShareModal] = useState({ isOpen: false, pdf: null });
    const [shareMessage, setShareMessage] = useState("");

    const getShareLink = (pdfUrl) => {
        return pdfUrl; // could replace with your deep linking logic
    };

    const generateQrCodeURL = (url) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    };

    const openShareModal = (pdf) => {
        setShareModal({ isOpen: true, pdf });
        setShareMessage(getShareLink(pdf.pdf));
    };

    return {
        shareModal,
        setShareModal,
        shareMessage,
        setShareMessage,
        openShareModal,
        getShareLink,
        generateQrCodeURL
    };
}
