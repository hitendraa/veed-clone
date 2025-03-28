import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, Minus, Plus, PlusCircle } from 'lucide-react';
import TimelineTrack from './TimelineTrack';

const MIN_ZOOM = 50; // pixels per second
const MAX_ZOOM = 200;
const MAJOR_MARKS_INTERVAL = 5; // seconds

export default function Timeline({ 
    mediaElements, 
    onMediaUpdate, 
    currentTime, 
    setCurrentTime, 
    isPlaying, 
    onPlayingChange,
    loadingVideos
}) {
    const [duration] = useState(60);
    const [pixelsPerSecond, setPixelsPerSecond] = useState(100);
    const [scrollPosition, setScrollPosition] = useState(0);
    const trackContainerRef = useRef(null);
    const totalWidth = duration * pixelsPerSecond;
    const [layers, setLayers] = useState([{ id: 'layer-1', tracks: [] }]);
    const [insertLinePosition, setInsertLinePosition] = useState(null);
    const [selectedLayerId, setSelectedLayerId] = useState('layer-1');
    
    const playbackRef = useRef(null);

    const addLayer = () => {
        setLayers(prev => [...prev, { id: `layer-${prev.length + 1}`, tracks: [] }]);
    };

    const handleTrackMove = (trackId, updates) => {
        const targetLayer = layers.find(l => l.id === updates.layerId);
        const tracksInTargetLayer = mediaElements.filter(m => m.layerId === updates.layerId);
        
        const hasOverlap = tracksInTargetLayer.some(track => {
            if (track.id === trackId) return false;
            const trackStart = track.position?.x || 0;
            const trackEnd = trackStart + (track.duration || 10) * pixelsPerSecond;
            const newTrackStart = updates.position.x;
            const newTrackEnd = newTrackStart + (mediaElements.find(m => m.id === trackId)?.duration || 10) * pixelsPerSecond;
            
            return !(newTrackEnd <= trackStart || newTrackStart >= trackEnd);
        });

        if (!hasOverlap) {
            onMediaUpdate(trackId, updates);
        }
    };

    const togglePlayback = () => {
        if (loadingVideos.size > 0) return; // Prevent playback while loading
        onPlayingChange(!isPlaying);
    };

    const getMaxDuration = useCallback(() => {
        return mediaElements.reduce((max, media) => {
            const endTime = (media.position?.x || 0) / pixelsPerSecond + (media.duration || 0);
            return Math.max(max, endTime);
        }, 60);
    }, [mediaElements, pixelsPerSecond]);

    useEffect(() => {
        if (isPlaying) {
            playbackRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    const maxDuration = getMaxDuration();
                    const nextTime = prev + 0.1;
                    
                    if (nextTime >= maxDuration) {
                        onPlayingChange(false);
                        return maxDuration;
                    }
                    return nextTime;
                });
            }, 100);
        } else {
            clearInterval(playbackRef.current);
        }
        return () => clearInterval(playbackRef.current);
    }, [isPlaying, getMaxDuration]);

    const handleScroll = (e) => {
        setScrollPosition(e.target.scrollLeft);
    };

    useEffect(() => {
        const trackContainer = trackContainerRef.current;
        if (trackContainer) {
            trackContainer.addEventListener('scroll', handleScroll);
            return () => trackContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleZoom = (direction) => {
        setPixelsPerSecond(prev => {
            const newValue = direction === 'in' ? prev * 1.2 : prev / 1.2;
            return Math.min(Math.max(newValue, MIN_ZOOM), MAX_ZOOM);
        });
    };

    const renderRuler = useCallback(() => {
        const marks = [];
        const visibleDuration = Math.ceil(totalWidth / pixelsPerSecond);

        for (let i = 0; i <= visibleDuration; i++) {
            const isMajor = i % MAJOR_MARKS_INTERVAL === 0;
            marks.push(
                <div
                    key={i}
                    className="absolute bottom-0"
                    style={{
                        left: `${i * pixelsPerSecond}px`,
                        height: isMajor ? '16px' : '8px',
                        width: '1px',
                        background: isMajor ? 'rgb(107 114 128)' : 'rgb(209 213 219)'
                    }}
                >
                    {isMajor && (
                        <div className="absolute -left-3 -top-6 text-xs text-gray-600 w-6 text-center">
                            {i}s
                        </div>
                    )}
                </div>
            );
        }
        return marks;
    }, [duration, pixelsPerSecond]);

    const handleLayerClick = (layerId) => {
        setSelectedLayerId(layerId);
    };

    const handleRulerClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left + trackContainerRef.current.scrollLeft;
        const newTime = x / pixelsPerSecond;
        setCurrentTime(newTime);
        setInsertLinePosition(x);
    };

    useEffect(() => {
        // Verify unique IDs for debugging
        const ids = mediaElements.map(m => m.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            console.warn('Duplicate media IDs found:', ids);
        }
    }, [mediaElements]);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="h-8 border-b border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-between px-2">
                <button
                    onClick={togglePlayback}
                    className={`w-8 h-8 flex items-center justify-center rounded-full
                        ${loadingVideos.size > 0 
                            ? 'bg-gray-100 cursor-not-allowed' 
                            : 'hover:bg-gray-200'}`}
                    disabled={loadingVideos.size > 0}
                >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                
                <div 
                    className="relative flex-1 h-full overflow-hidden mx-32"
                    onClick={handleRulerClick}
                >
                    <div 
                        className="absolute inset-0" 
                        style={{ 
                            width: totalWidth,
                            transform: `translateX(-${scrollPosition}px)`,
                        }}
                    >
                        {renderRuler()}
                    </div>
                    <div 
                        className="absolute h-[100vh] w-0.5 bg-blue-500 z-10 pointer-events-none"
                        style={{ 
                            transform: `translateX(${currentTime * pixelsPerSecond}px)`,
                            top: 0,
                        }}
                    />
                </div>
                <div className="flex items-center gap-1 ml-2 bg-white rounded-md shadow-sm px-1">
                    <button
                        onClick={() => handleZoom('out')}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        disabled={pixelsPerSecond <= MIN_ZOOM}
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-xs text-gray-600 w-12 text-center">
                        {Math.round(pixelsPerSecond)}px/s
                    </span>
                    <button
                        onClick={() => handleZoom('in')}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        disabled={pixelsPerSecond >= MAX_ZOOM}
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
            
            <div className="flex">
                <div className="w-32 flex-shrink-0 bg-gray-100 border-r border-gray-200">
                    <div className="text-sm font-medium text-gray-600 px-3 py-2">Layers</div>
                </div>
                <div className="flex-1" />
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-32 flex-shrink-0 bg-gray-50 border-r border-gray-200">
                    {layers.map((layer) => (
                        <div 
                            key={layer.id} 
                            className={`h-14 px-3 flex items-center border-b border-gray-200 cursor-pointer
                                ${selectedLayerId === layer.id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                            onClick={() => handleLayerClick(layer.id)}
                        >
                            <span className="text-sm text-gray-600">Layer {layer.id.split('-')[1]}</span>
                        </div>
                    ))}
                    <button
                        onClick={addLayer}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full"
                    >
                        <PlusCircle size={16} />
                        Add Layer
                    </button>
                </div>

                <div 
                    ref={trackContainerRef}
                    className="flex-1 overflow-x-auto overflow-y-auto relative"
                >
                    {insertLinePosition !== null && (
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-50 pointer-events-none"
                            style={{ left: insertLinePosition }}
                        />
                    )}
                    <div style={{ width: totalWidth, minHeight: '100%' }}>
                        {layers.map((layer) => (
                            <div 
                                key={layer.id}  // Added key here 
                                className="h-14 border-b border-gray-200 relative"
                                data-layer-id={layer.id}
                            >
                                {mediaElements
                                    .filter(media => media.layerId === layer.id)
                                    .map((media) => (
                                        <TimelineTrack 
                                            key={media.id}
                                            media={media}
                                            pixelsPerSecond={pixelsPerSecond}
                                            layerId={layer.id}
                                            onTrackMove={(id, updates) => {
                                                if (updates.action === 'delete') {
                                                    onMediaUpdate(id, { action: 'delete' });
                                                } else {
                                                    handleTrackMove(id, updates);
                                                }
                                            }}
                                            currentTime={currentTime}
                                            isPlaying={isPlaying}
                                            allTracksInLayer={mediaElements.filter(m => m.layerId === layer.id)}
                                            allLayers={layers}
                                        />
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
