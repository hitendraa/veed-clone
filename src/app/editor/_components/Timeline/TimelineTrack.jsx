import { Rnd } from 'react-rnd';
import { Image, Video, Trash2 } from 'lucide-react';

export default function TimelineTrack({ 
    media, 
    pixelsPerSecond, 
    layerId, 
    onTrackMove, 
    currentTime,
    isPlaying,
    allTracksInLayer,
    allLayers,
    ...props 
}) {
    const duration = media.type === 'video' ? (media.duration || 10) : 5; 
    const width = duration * pixelsPerSecond;

    const findNearestSnap = (currentX) => {
        const SNAP_THRESHOLD = 20;
        let nearestSnap = null;
        let minDistance = SNAP_THRESHOLD;

        const layerTracks = allTracksInLayer.filter(t => t.id !== media.id);
        
        layerTracks.forEach(track => {
            const trackEnd = (track.position?.x || 0) + (track.duration || 10) * pixelsPerSecond;
            const distance = Math.abs(currentX - trackEnd);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestSnap = trackEnd;
            }
        });

        return nearestSnap;
    };

    const handleResize = (e, direction, ref, delta, position) => {
        const newDuration = Math.max(ref.offsetWidth / pixelsPerSecond, 1); 
        onTrackMove(media.id, {
            duration: newDuration,
            position: {
                x: position.x,
                y: 0
            }
        });
    };

    const getMediaIcon = () => {
        if (media.type === 'video') return <Video size={16} className="text-blue-500" />;
        return <Image size={16} className="text-green-500" />;
    };

    return (
        <Rnd
            {...props}
            default={{
                x: media.position?.x || 0,
                y: 0,
                width: width,
                height: 44 
            }}
            enableResizing={{ 
                right: true,  
                left: media.type === 'video' 
            }}
            dragAxis="x"
            bounds="parent"
            className={`absolute top-1 ${media.isLoading ? 'opacity-50 pointer-events-none' : ''}`}
            onDrag={(e, d) => {
                const nearestSnap = findNearestSnap(d.x);
                if (nearestSnap !== null) {
                    d.x = nearestSnap;
                }
            }}
            onDragStop={(e, d) => {
                const targetLayer = e.target.closest('[data-layer-id]');
                if (!targetLayer) return;

                const targetLayerId = targetLayer.dataset.layerId;
                const newX = Math.max(0, d.x);
                
                onTrackMove(media.id, {
                    layerId: targetLayerId,
                    position: { x: newX, y: 0 }
                });
            }}
            onResizeStop={handleResize}
            style={{
                zIndex: parseInt(layerId.split('-')[1]),
                opacity: media.isLoading ? 0.5 : 1
            }}
        >
            <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 flex items-stretch group">
                <div className={`flex items-center px-3 border-r border-gray-200 
                    ${media.type === 'video' ? 'bg-blue-50' : 'bg-green-50'}`}>
                    <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center
                            ${media.type === 'video' ? 'bg-blue-500' : 'bg-green-500'}`}>
                            {getMediaIcon()}
                        </div>
                        <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate">
                            {media.name}
                        </span>
                    </div>
                </div>
                <div className={`flex-1 relative ${
                    media.type === 'video' 
                        ? 'bg-gradient-to-r from-blue-100/50 to-blue-50/50'
                        : 'bg-gradient-to-r from-green-100/50 to-green-50/50'
                }`}>
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-xs text-gray-500">{duration}s</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onTrackMove(media.id, { action: 'delete' });
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity 
                                     bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </Rnd>
    );
}
