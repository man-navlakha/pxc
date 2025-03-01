// src/ImageUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
    const [file, setFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const url = 'https://upload.imagekit.io/api/v1/files/upload';
        const apiKey = 'YOUR_IMAGEKIT_API_KEY'; // Replace with your ImageKit API Key
        const publicKey = 'YOUR_IMAGEKIT_PUBLIC_KEY'; // Replace with your ImageKit Public Key
        const privateKey = 'YOUR_IMAGEKIT_PRIVATE_KEY'; // Replace with your ImageKit Private Key

        // Generate a signature
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = btoa(`${privateKey}${timestamp}`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('publicKey', publicKey);

        try {
            const response = await axios.post(url, formData);
            setUploadResult(response.data);
            setError(null);
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('Error uploading file. Please try again.');
            setUploadResult(null);
        }
    };

    return (
        <div className="container">
            <h1>Upload Image to ImageKit</h1>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            <button onClick={handleUpload}>Upload</button>
            {uploadResult && (
                <div>
                    <h2>Upload Successful!</h2>
                    <img src={uploadResult.url} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ImageUpload;