// hooks/useFileUploadHandler.js
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function useFileUploadHandler() {
    const [files, setFiles] = useState([]);
    const [content, setContent] = useState('');
    const [sub, setSub] = useState('');
    const [cource, setCource] = useState('' || "1");
    const [semester, setSemester] = useState('');
    const [choise, setChoise] = useState('');
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
        formData.append("sem", semester || 5);
        formData.append("choose", choise);
        formData.append("sub", sub);
        files.forEach(file => formData.append("pdf", file));  // multiple pdf files


        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, value.name);
            } else {
                console.log(`${key}:`, value);
            }
        }

        if (!content.trim()) {
            alert("Please enter a description or title for the upload.");
            return;
        }

        if (!sub.trim()) {
            alert("Please enter the subject name.");
            return;
        }

        if (!semester.trim()) {
            alert("Please select or enter the semester.");
            return;
        }

        if (!choise.trim()) {
            alert("Please select a category from the dropdown.");
            return;
        }

        if (files.length === 0) {
            alert("Please select at least one PDF file to upload.");
            return;
        }




        try {
            setUploading(true);
            const res = await fetch("https://pixel-classes.onrender.com/api/home/QuePdf/Add/", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Upload failed with response:", errorText);
                throw new Error("Upload failed");
            }

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
        setChoise,
        setSemester, setCource, setSub,
        handleFileChange,
        handleSubmit,
        isUploading,
        choise
    };
}
