import { Rnd } from 'react-rnd';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@mantine/core';

const MediaElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete,
  canvasDimensions,
  videoRef,
  currentTime,
  isPlaying,
  isVisible,
  ...props 
}) => {
  const ref = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(true);

  const getLoadingMessage = (progress) => {
    if (progress === 0) return 'Preparing video...';
    if (progress < 25) return 'Buffering video...';
    if (progress < 50) return 'Processing video...';
    if (progress < 75) return 'Almost ready...';
    return 'Finalizing...';
  };

  useEffect(() => {
    if (element.type === 'video' && videoRef && ref.current) {
      videoRef.current[element.id] = ref.current;
    }
    return () => {
      if (videoRef?.current) {
        delete videoRef.current[element.id];
      }
    };
  }, [element.id, videoRef]);

  useEffect(() => {
    const video = ref.current;
    if (!video || element.type !== 'video') return;

    const handleCanPlay = () => setIsLoading(false);
    video.addEventListener('canplay', handleCanPlay);

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }

    return () => video.removeEventListener('canplay', handleCanPlay);
  }, [isPlaying, element.type]);

  useEffect(() => {
    const video = ref.current;
    if (video && element.type === 'video' && Math.abs(video.currentTime - currentTime) > 0.1) {
      video.currentTime = currentTime;
    }
  }, [currentTime, element.type]);

  useEffect(() => {
    setDownloadProgress(element.loadProgress || 0);
    setIsDownloading(element.loadProgress < 100);
    
    if (element.type === 'video') {
      console.log(`Video ${element.id} progress: ${element.loadProgress}%`);
    }
  }, [element.loadProgress, element.id, element.type]);

  useEffect(() => {
    const video = ref.current;
    if (!video || element.type !== 'video') return;

    video.dataset.mediaId = element.id;

    if (video.readyState >= 2) {
      try {
        video.currentTime = currentTime - ((element.position?.x || 0) / 100);
        if (isPlaying) {
          video.play().catch(err => console.log('Playback error:', err));
        } else {
          video.pause();
        }
      } catch (err) {
        console.error('Video timing error:', err);
      }
    }

  }, [element.id, currentTime, isPlaying, element.position?.x]);

  const startTime = (element.position?.x || 0) / 100;
  const endTime = startTime + (element.type === 'video' ? element.duration : 5);

  useEffect(() => {
    const elem = ref.current;
    if (!elem) return;

    if (!isVisible || currentTime < startTime || currentTime >= endTime) {
        elem.style.display = 'none';
        if (element.type === 'video') {
            elem.pause();
        }
    } else {
        elem.style.display = 'block';
        if (element.type === 'video') {
            elem.currentTime = currentTime - startTime;
            if (isPlaying) elem.play();
        }
    }
  }, [isVisible, currentTime, startTime, endTime, isPlaying]);

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!isVisible) return;
    onSelect(element.id);
  };

  if (!isVisible && element.type === 'video') return null;

  return (
    <Rnd
      default={{
        x: canvasDimensions.width / 2 - (element.size?.width || canvasDimensions.width / 4) / 2,
        y: canvasDimensions.height / 2 - (element.size?.height || canvasDimensions.height / 4) / 2,
        width: element.size?.width || canvasDimensions.width / 2,
        height: element.size?.height || canvasDimensions.height / 2,
      }}
      dragHandleClassName="drag-handle"
      position={element.position}
      size={element.size}
      minWidth={100}
      minHeight={100}
      className={`group relative ${
        isSelected 
          ? 'ring-1 ring-blue-500/80' 
          : 'hover:ring-1 hover:ring-white/30'
      }`}
      bounds="parent"
      onClick={handleSelect}
      onDragStop={(e, d) => {
        onUpdate(element.id, { 
          position: { x: d.x, y: d.y } 
        });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdate(element.id, {
          position: position,
          size: {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          }
        });
      }}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      resizeHandleClasses={{
        top: 'resize-handle',
        right: 'resize-handle',
        bottom: 'resize-handle',
        left: 'resize-handle',
        topRight: 'resize-handle',
        bottomRight: 'resize-handle',
        bottomLeft: 'resize-handle',
        topLeft: 'resize-handle',
      }}
      style={{ 
        transform: `rotate(${element.rotation || 0}deg)`,
        zIndex: parseInt(element.layerId.split('-')[1])
      }}
      {...props}
    >
      <div className="relative w-full h-full">
        <div className="drag-handle absolute inset-0 cursor-move">
          {element.type === 'image' ? (
            <img
              src={element.url}
              alt={element.name}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={ref}
                src={element.localUrl || element.url}
                className="w-full h-full object-cover pointer-events-none"
                controls={false}
                draggable={false}
                playsInline
                muted
                preload="auto"
                onLoadedMetadata={(e) => {
                  if (!element.duration) {
                    onUpdate(element.id, { 
                      duration: e.target.duration,
                      isLoading: false,
                      size: {
                        width: canvasDimensions.width / 2,
                        height: canvasDimensions.height / 2
                      }
                    });
                  }
                  setIsLoading(false);
                }}
              />
              {isDownloading && element.type === 'video' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
                  <div className="mb-4 text-white text-sm font-medium">
                    {downloadProgress}% Downloaded
                  </div>
                  <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {!isDownloading && isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader color="white" size="sm" />
                  <span className="ml-2 text-white text-sm">Loading video...</span>
                </div>
              )}
            </div>
          )}
        </div>
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(element.id);
            }}
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 
                       rounded-full flex items-center justify-center
                       text-white text-sm font-medium shadow-lg
                       hover:bg-red-600 transition-colors duration-150
                       opacity-0 group-hover:opacity-100 z-50"
          >
            ×
          </button>
        )}
      </div>
    </Rnd>
  );
};

const styles = `
  .resize-handle {
    width: 8px !important;
    height: 8px !important;
    background-color: #fff !important;
    border: 1px solid rgba(59, 130, 246, 0.5) !important;
    border-radius: 4px !important;
  }
  .resize-handle:hover {
    background-color: #3b82f6 !important;
  }
  .drag-handle {
    -webkit-app-region: no-drag;
  }
  .drag-handle:active {
    cursor: grabbing;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default MediaElement;
