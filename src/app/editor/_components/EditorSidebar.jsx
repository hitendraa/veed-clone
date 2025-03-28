'use client';
import { useState, useEffect } from 'react';

const EditorSidebar = ({ onToolSelect }) => {
  const [activeTool, setActiveTool] = useState('media'); // Set default to media

  useEffect(() => {
    onToolSelect?.('media'); // Trigger initial selection
  }, []);

  const handleToolClick = (tool) => {
    setActiveTool(activeTool === tool ? null : tool);
    onToolSelect?.(activeTool === tool ? null : tool);
  };

  return (
    <div className="w-16 flex flex-col items-center py-4 border-r border-gray-300 h-screen">
      {/* Top hamburger */}
      <div className="mb-8">
        <img 
          src="/svg/hamburger.svg" 
          alt="menu"
          className="w-6 h-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Main menu icons */}
      <div className="flex flex-col gap-10 flex-1">
        {[
          'search',
          'settings',
          'brand-kit',
          'media',
          'audio',
          'subtitles',
          'text',
          'record'
        ].map((icon) => (
          <img
            key={icon}
            src={`/svg/${icon}.svg`}
            alt={icon}
            className={`w-12 h-12 cursor-pointer transition-opacity
              ${activeTool === icon ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            onClick={() => handleToolClick(icon)}
          />
        ))}
      </div>

      {/* Help icon at bottom */}
      <div className="mt-auto">
        <img
          src="/svg/help.svg"
          alt="help"
          className="w-6 h-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
};

export default EditorSidebar;