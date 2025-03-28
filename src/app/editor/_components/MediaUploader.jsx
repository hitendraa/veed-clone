'use client';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { useUserDetail } from '@/app/context/UserDetailContext';
import { Group, Text, rem, Loader, Progress } from '@mantine/core';
import { Upload, Image, Video } from 'lucide-react';

export default function MediaUploader({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { userDetail } = useUserDetail();

    const onDrop = async (acceptedFiles) => {
        try {
            setUploading(true);
            setUploadProgress(0);
            
            for (const file of acceptedFiles) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('email', userDetail.email);

                const xhr = new XMLHttpRequest();
                
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = (event.loaded / event.total) * 100;
                        setUploadProgress(Math.round(progress));
                    }
                };

                const response = await new Promise((resolve, reject) => {
                    xhr.open('POST', '/api/media');
                    xhr.onload = () => resolve(xhr.response);
                    xhr.onerror = () => reject(xhr.statusText);
                    xhr.send(formData);
                });

                const data = JSON.parse(response);
                onUploadComplete?.(data);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'video/*': ['.mp4', '.webm', '.mov']
        }
    });

    return (
        <div className="space-y-4">
            <div 
                {...getRootProps()} 
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                    transition-all duration-300 ease-in-out transform
                    ${isDragActive 
                        ? 'border-blue-500 bg-blue-50 scale-102 shadow-lg' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                `}
            >
                <input {...getInputProps()} />
                {isDragActive && (
                    <div className="absolute inset-0 bg-blue-500/10 rounded-xl animate-pulse" />
                )}
                <Group justify="center" gap="xl" className="relative z-10">
                    {uploading ? (
                        <div className="animate-bounce">
                            <Loader size="md" color="blue" />
                        </div>
                    ) : (
                        <Upload 
                            size={40}
                            className={`${isDragActive ? 'text-blue-500' : 'text-gray-500'} 
                                transition-colors duration-300`}
                            strokeWidth={1.5}
                        />
                    )}
                    <div>
                        <Text size="xl" className={`font-medium mb-1 ${isDragActive ? 'text-blue-500' : ''}`}>
                            {uploading 
                                ? 'Uploading your files...' 
                                : isDragActive 
                                    ? 'Drop your files here!' 
                                    : 'Drag files here or click to select'
                            }
                        </Text>
                        <Text size="sm" c="dimmed" className="transition-colors duration-300">
                            Support for images and videos up to 50MB each
                        </Text>
                    </div>
                </Group>
                <Group justify="center" gap="md" mt="xl">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                        ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Image size={16} className={isDragActive ? 'text-blue-500' : 'text-gray-500'} />
                        <span className="text-xs text-gray-600">Images</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                        ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Video size={16} className={isDragActive ? 'text-blue-500' : 'text-gray-500'} />
                        <span className="text-xs text-gray-600">Videos</span>
                    </div>
                </Group>
            </div>
            {uploading && (
                <Progress 
                    value={uploadProgress} 
                    size="sm" 
                    radius="xl" 
                    animate
                    label={`${uploadProgress}%`}
                />
            )}
        </div>
    );
}
