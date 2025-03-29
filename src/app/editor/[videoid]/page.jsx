'use client';
import { useState, useRef, useEffect } from 'react';
import EditorSidebar from "../_components/EditorSidebar";
import SecondaryToolbar from "../_components/SecondaryToolbar";
import { Select } from '@mantine/core';
import { Rnd } from 'react-rnd';
import VideoCanvas from '../_components/Canvas/VideoCanvas';
import Timeline from '../_components/Timeline/Timeline';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { loadMedia } from '../_utils/videoHelper';

const CANVAS_PRESETS = [
    { value: 'youtube', label: 'YouTube Video (16:9)', width: 1920, height: 1080 },
    { value: 'instagram-reel', label: 'Instagram Reel (9:16)', width: 1080, height: 1920 },
    { value: 'youtube-shorts', label: 'YouTube Shorts (9:16)', width: 1080, height: 1920 },
    { value: 'square', label: 'Square (1:1)', width: 1080, height: 1080 },
];

function generateUniqueId() {
    return `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function EditorPage({ params }) {
    const [activeTool, setActiveTool] = useState('media');
    const [mediaElements, setMediaElements] = useState([]);
    const [canvasPreset, setCanvasPreset] = useState(CANVAS_PRESETS[0]);
    const [showCenterGuide, setShowCenterGuide] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRefs = useRef({});
    const [timelineHeight, setTimelineHeight] = useState(192); // 48 * 4
    const minTimelineHeight = 192;
    const maxTimelineHeight = 480;

    
    const [loadedVideos, setLoadedVideos] = useState(new Map());
    const [loadingVideos, setLoadingVideos] = useState(new Set());

    useEffect(() => {
        if (isPlaying) {
            Object.values(videoRefs.current).forEach(video => {
                if (video) video.play();
            });
        } else {
            Object.values(videoRefs.current).forEach(video => {
                if (video) video.pause();
            });
        }
    }, [isPlaying]);

    const handleTimeUpdate = (time) => {
        setCurrentTime(time);
        
        const visibleMedia = mediaElements.filter(media => {
            const startTime = (media.position?.x || 0) / 100;
            const endTime = startTime + (media.type === 'video' ? (media.duration || 0) : 5);
            return time >= startTime && time < endTime;
        });

        mediaElements.forEach(media => {
            const element = document.querySelector(`[data-media-id="${media.id}"]`);
            if (!element) return;

            const startTime = (media.position?.x || 0) / 100;
            const endTime = startTime + (media.type === 'video' ? (media.duration || 0) : 5);
            const isVisible = time >= startTime && time < endTime;

            element.style.display = isVisible ? 'block' : 'none';

            if (media.type === 'video' && videoRefs.current[media.id]) {
                const video = videoRefs.current[media.id];
                if (isVisible) {
                    video.currentTime = time - startTime;
                    if (isPlaying) video.play();
                } else {
                    video.pause();
                }
            }
        });
    };

    const handleMediaSelect = async (asset) => {
        const newId = generateUniqueId();
        try {
            const sortedMedia = [...mediaElements].sort((a, b) => {
                const aEnd = (a.position?.x || 0) + ((a.type === 'video' ? a.duration : 5) * 100);
                const bEnd = (b.position?.x || 0) + ((b.type === 'video' ? b.duration : 5) * 100);
                return bEnd - aEnd;
            });

            const lastMedia = sortedMedia[sortedMedia.length - 1];
            const newX = lastMedia 
                ? (lastMedia.position?.x || 0) + ((lastMedia.type === 'video' ? lastMedia.duration : 5) * 100)
                : 0;

            let localUrl = asset.url;
            if (asset.type === 'video') {
                localUrl = URL.createObjectURL(await (await fetch(asset.url)).blob());
            }

            const newMedia = {
                id: newId,
                layerId: 'layer-1',
                position: { 
                    x: newX, 
                    y: 0 
                },
                canvasPosition: null, 
                ...asset,
                localUrl,
                duration: asset.type === 'video' ? 0 : 5 
            };

            setMediaElements(prev => [...prev, newMedia]);

        } catch (error) {
            console.error('Error adding media:', error);
            setMediaElements(prev => prev.filter(elem => elem.id !== newId));
        }
    };

    
    useEffect(() => {
        return () => {
            loadedVideos.forEach(url => URL.revokeObjectURL(url));
        };
    }, [loadedVideos]);

    const handleMediaUpdate = (id, updates) => {
        if (updates?.action === 'delete') {
            setMediaElements(prev => prev.filter(elem => elem.id !== id));
        } else {
            
            setMediaElements(prev => prev.map(elem => 
                elem.id === id ? { ...elem, ...updates } : elem
            ));
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            <EditorSidebar onToolSelect={setActiveTool} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex overflow-hidden min-h-0">
                    <SecondaryToolbar 
                        activeTool={activeTool}
                        onMediaSelect={handleMediaSelect}
                    />
                    <div className="flex-1 bg-slate-50 overflow-hidden">
                        <VideoCanvas
                            mediaElements={mediaElements}
                            onMediaUpdate={handleMediaUpdate}
                            videoRefs={videoRefs}
                            currentTime={currentTime}
                            isPlaying={isPlaying}
                        />
                    </div>
                </div>
                
                <ResizableBox
                    width={Infinity}
                    height={timelineHeight}
                    minConstraints={[Infinity, minTimelineHeight]}
                    maxConstraints={[Infinity, maxTimelineHeight]}
                    resizeHandles={['n']}
                    axis="y"
                    onResizeStop={(e, { size }) => setTimelineHeight(size.height)}
                    className="border-t border-gray-200 bg-white"
                >
                    <Timeline 
                        mediaElements={mediaElements} 
                        onMediaUpdate={handleMediaUpdate}
                        currentTime={currentTime}
                        setCurrentTime={setCurrentTime}  
                        isPlaying={isPlaying}
                        onTimeUpdate={handleTimeUpdate}
                        onPlayingChange={setIsPlaying}
                        loadingVideos={loadingVideos}
                    />
                </ResizableBox>
            </div>
        </div>
    );
}
