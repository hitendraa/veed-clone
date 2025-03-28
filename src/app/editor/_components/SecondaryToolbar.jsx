'use client';
import { useState, useEffect } from 'react';
import MediaUploader from './MediaUploader';
import { useUserDetail } from '@/app/context/UserDetailContext';

const SecondaryToolbar = ({ activeTool }) => {
  const [assets, setAssets] = useState([]);
  const { userDetail } = useUserDetail();

  const fetchAssets = async () => {
    if (!userDetail?.email) return;
    const res = await fetch(`/api/media?email=${userDetail.email}`);
    const data = await res.json();
    setAssets(data);
  };

  useEffect(() => {
    if (activeTool === 'media') {
      fetchAssets();
    }
  }, [activeTool, userDetail]);

  if (!activeTool) return null;

  return (
    <div className="w-72 border-r border-gray-200 bg-white h-[calc(100vh-12rem)]">
      <div className="p-4 h-full overflow-y-auto space-y-4">
        <h3 className="text-sm font-medium capitalize">{activeTool}</h3>
        
        {activeTool === 'media' && (
          <>
            <MediaUploader onUploadComplete={fetchAssets} />
            <div className="grid grid-cols-2 gap-2">
              {assets.map((asset) => (
                <div key={asset.id} className="relative group">
                  {asset.type === 'image' ? (
                    <img 
                      src={asset.url} 
                      alt={asset.name}
                      className="aspect-video object-cover rounded-md"
                    />
                  ) : (
                    <video 
                      src={asset.url}
                      className="aspect-video object-cover rounded-md"
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SecondaryToolbar;
