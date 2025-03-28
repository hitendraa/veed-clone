'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Select, ColorPicker, Menu, Tabs, Skeleton } from '@mantine/core';
import { Layout, Palette, Image } from 'lucide-react';
import MediaElement from './MediaElement';

const CANVAS_PRESETS = [
  { value: 'youtube', label: 'YouTube Video (16:9)', width: 1920, height: 1080 },
  { value: 'instagram-reel', label: 'Instagram Reel (9:16)', width: 1080, height: 1920 },
  { value: 'youtube-shorts', label: 'YouTube Shorts (9:16)', width: 1080, height: 1920 },
  { value: 'square', label: 'Square (1:1)', width: 1080, height: 1080 },
];

const PRESET_COLORS = [
  '#1A1B1E', // Default dark
  '#000000', // Pure black
  '#FFFFFF', // White
  '#0F172A', // Slate dark
  '#18181B', // Zinc dark
  '#171717', // Neutral dark
  '#0C4A6E', // Sky dark
  '#831843', // Pink dark
  '#3730A3', // Indigo dark
];

const VideoCanvas = ({ 
  mediaElements = [], 
  onMediaUpdate, 
  videoRefs,
  currentTime,
  isPlaying,
  ...props
}) => {
  const [canvasPreset, setCanvasPreset] = useState(CANVAS_PRESETS[0]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [canvasBackground, setCanvasBackground] = useState('#1A1B1E');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoadingBackground, setIsLoadingBackground] = useState(false);
  const containerRef = useRef(null);

  const calculateCanvasDimensions = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Leave 32px padding on each side
    const maxWidth = containerWidth - 64;
    const maxHeight = containerHeight - 64;

    const canvasAspectRatio = canvasPreset.width / canvasPreset.height;
    const containerAspectRatio = maxWidth / maxHeight;

    let width, height;

    if (canvasAspectRatio > containerAspectRatio) {
      // Canvas is wider than container
      width = maxWidth;
      height = maxWidth / canvasAspectRatio;
    } else {
      // Canvas is taller than container
      height = maxHeight;
      width = maxHeight * canvasAspectRatio;
    }

    setCanvasDimensions({ width, height });
  };

  useEffect(() => {
    calculateCanvasDimensions();
    window.addEventListener('resize', calculateCanvasDimensions);
    return () => window.removeEventListener('resize', calculateCanvasDimensions);
  }, [canvasPreset]);

  const handlePresetChange = (value) => {
    const newPreset = CANVAS_PRESETS.find(preset => preset.value === value);
    setCanvasPreset(newPreset);
  };

  const handleDelete = (id) => {
    setSelectedElementId(null);
    onMediaUpdate(id, { action: 'delete' });
  };

  const handleRotate = (id, currentRotation = 0) => {
    onMediaUpdate(id, { rotation: (currentRotation + 90) % 360 });
  };

  const handleBackgroundImageSelect = async (imageUrl) => {
    setIsLoadingBackground(true);
    try {
      // Preload image
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      setBackgroundImage(imageUrl);
    } catch (error) {
      console.error('Failed to load background image:', error);
    } finally {
      setIsLoadingBackground(false);
    }
  };

  const getVisibleMediaElements = useCallback(() => {
    // Return all media elements without filtering by time
    return mediaElements.sort((a, b) => 
      parseInt(a.layerId.split('-')[1]) - parseInt(b.layerId.split('-')[1])
    );
  }, [mediaElements]);

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden"
      >
        <div 
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
            background: backgroundImage ? `url(${backgroundImage}) center/cover` : canvasBackground,
          }}
          className="rounded-lg relative shadow-lg"
          {...props}
        >
          {isLoadingBackground && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
              <div className="animate-pulse text-white">Loading background...</div>
            </div>
          )}
          {getVisibleMediaElements().map((element) => (
            <MediaElement
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              onSelect={setSelectedElementId}
              onUpdate={onMediaUpdate}
              onDelete={handleDelete}
              canvasDimensions={canvasDimensions}
              videoRef={videoRefs}
              currentTime={currentTime}
              isPlaying={isPlaying}
              isVisible={true}
              style={{
                zIndex: parseInt(element.layerId.split('-')[1])
              }}
            />
          ))}
        </div>
      </div>

      <div className="bg-slate-100 py-3 px-4 mb-2 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-md shadow-sm">
          <div className="px-2 py-1.5 border-r">
            <Layout size={16} className="text-gray-500" />
          </div>
          <Select
            data={CANVAS_PRESETS}
            value={canvasPreset.value}
            onChange={handlePresetChange}
            size="xs"
            variant="unstyled"
            className="w-40"
            styles={{ input: { border: 'none', paddingLeft: 8 } }}
          />
        </div>

        <Menu position="top" shadow="md">
          <Menu.Target>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md shadow-sm hover:bg-gray-50">
              <Palette size={16} className="text-gray-500" />
              <div 
                className="w-4 h-4 rounded-full border shadow-sm"
                style={{ background: canvasBackground }}
              />
            </button>
          </Menu.Target>
          <Menu.Dropdown>
            <Tabs defaultValue="color">
              <Tabs.List grow>
                <Tabs.Tab value="color" leftSection={<Palette size={14} />}>Color</Tabs.Tab>
                <Tabs.Tab value="image" leftSection={<Image size={14} />}>Image</Tabs.Tab>
              </Tabs.List>

              <div className="p-3">
                <Tabs.Panel value="color">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCanvasBackground(color)}
                        className={`w-8 h-8 rounded-full border shadow-sm hover:scale-110 transition-transform
                          ${canvasBackground === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        `}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                  <ColorPicker
                    format="hex"
                    value={canvasBackground}
                    onChange={setCanvasBackground}
                    size="xs"
                    className="mt-2"
                  />
                </Tabs.Panel>

                <Tabs.Panel value="image">
                  <div className="grid grid-cols-3 gap-2">
                    {mediaElements
                      .filter(el => el.type === 'image')
                      .map(image => (
                        <button
                          key={image.id}
                          onClick={() => handleBackgroundImageSelect(image.url)}
                          className={`
                            w-16 h-16 rounded-md overflow-hidden
                            ${backgroundImage === image.url ? 'ring-2 ring-blue-500' : ''}
                          `}
                        >
                          {isLoadingBackground ? (
                            <Skeleton height="100%" radius="md" animate={true} />
                          ) : (
                            <img 
                              src={image.url} 
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                  </div>
                </Tabs.Panel>
              </div>
            </Tabs>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
};

export default VideoCanvas;