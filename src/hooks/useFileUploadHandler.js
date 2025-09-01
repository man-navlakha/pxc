// hooks/useFileUploadHandler.js
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function useFileUploadHandler() {
    const [files, setFiles] = useState([]);
    const [content, setContent] = useState('');
    const [subject, setSubject] = useState('');
    const [cource, setCource] = useState('' || "1");
    const [sem, setSem] = useState('');
    const [choose, setChoose] = useState('');
    const [isUploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const isAllPdf = selectedFiles.every(file => file.type === "application/pdf");

        if (!isAllPdf) {
            alert("Only PDF files are allowed!");
            return;
        }

        setFiles(selectedFiles);
    };

    const handleSubmit = async () => {
        if (!content.trim() || files.length === 0) {
            alert("Please provide content and at least one file.");
            return;
        }

        const formData = new FormData();
        formData.append("name", content);
        formData.append("username", Cookies.get("username"));
        formData.append("course_id", 1);
        formData.append("sem", sem);
        formData.append("choose", choose);
        formData.append("sub", subject);

        files.forEach(file => formData.append("pdf", file));

        try {
            setUploading(true);
            const res = await fetch("https://pixel-classes.onrender.com/api/home/QuePdf/Add/", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            alert("Uploaded successfully");
            setFiles([]);
            setContent('');
        } catch (err) {
            alert("Upload error");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return {
        files,
        content,
        setContent,
        setChoose,
        setSem, setCource, setSubject,
        handleFileChange,
        handleSubmit,
        isUploading
    };
}
