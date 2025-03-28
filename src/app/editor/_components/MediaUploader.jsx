'use client';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { useUserDetail } from '@/app/context/UserDetailContext';

export default function MediaUploader({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const { userDetail } = useUserDetail();

    const onDrop = async (acceptedFiles) => {
        try {
            setUploading(true);
            for (const file of acceptedFiles) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('email', userDetail.email);

                const res = await fetch('/api/media', {
                    method: 'POST',
                    body: formData,
                });
                
                if (!res.ok) throw new Error('Upload failed');
                
                const data = await res.json();
                onUploadComplete?.(data);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
            <input {...getInputProps()} />
            {uploading ? (
                <p>Uploading...</p>
            ) : (
                <p>Drag & drop files here, or click to select files</p>
            )}
        </div>
    );
}
