'use client';
import { useState, useEffect } from 'react';
import MediaUploader from './MediaUploader';
import { useUserDetail } from '@/app/context/UserDetailContext';
import { Tabs, Text, Badge, ActionIcon, Menu, Skeleton } from '@mantine/core';
import { Image, Video, MoreVertical, Trash2, Download, Clock, HardDrive } from 'lucide-react';

const SecondaryToolbar = ({ activeTool }) => {
    const [assets, setAssets] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const { userDetail } = useUserDetail();

    const fetchAssets = async () => {
        if (!userDetail?.email) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/media?email=${userDetail.email}`);
            const data = await res.json();
            setAssets(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTool === 'media') {
            fetchAssets();
        }
    }, [activeTool, userDetail]);

    const filteredAssets = assets.filter(asset => 
        filter === 'all' || asset.type === filter
    );

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    };

    const toggleAssetSelection = (assetId) => {
        setSelectedAssets(prev => 
            prev.includes(assetId) 
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        );
    };

    if (!activeTool) return null;

    return (
        <div className="w-80 border-r border-gray-200 bg-white h-[calc(100vh-12rem)]">
            <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <Text className="text-lg font-medium capitalize">{activeTool}</Text>
                    <Badge variant="light" size="lg">{assets.length} items</Badge>
                </div>
                
                {activeTool === 'media' && (
                    <>
                        <MediaUploader onUploadComplete={fetchAssets} />
                        
                        <Tabs 
                            value={filter} 
                            onChange={setFilter} 
                            className="mt-4"
                            styles={{
                                tab: {
                                    '&[data-active]': {
                                        background: 'rgb(59 130 246 / 0.1)',
                                        color: '#2563eb',
                                        borderColor: 'transparent'
                                    }
                                }
                            }}
                        >
                            <Tabs.List className="space-x-2 mb-4 bg-gray-50/50 p-1 rounded-lg">
                                <Tabs.Tab value="all" className="rounded-md">All</Tabs.Tab>
                                <Tabs.Tab 
                                    value="image" 
                                    leftSection={<Image size={16} />}
                                    className="rounded-md"
                                >
                                    Images
                                </Tabs.Tab>
                                <Tabs.Tab 
                                    value="video" 
                                    leftSection={<Video size={16} />}
                                    className="rounded-md"
                                >
                                    Videos
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs>

                        <div className="grid grid-cols-2 gap-3 mt-4 overflow-y-auto p-1">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton height={120} radius="md" animate={true} />
                                        <Skeleton height={20} width="70%" radius="sm" />
                                    </div>
                                ))
                            ) : (
                                filteredAssets.map((asset) => (
                                    <div 
                                        key={asset.id} 
                                        onClick={() => toggleAssetSelection(asset.id)}
                                        className={`
                                            group relative bg-gray-50 rounded-lg overflow-hidden
                                            transition-all duration-200 cursor-pointer
                                            ${selectedAssets.includes(asset.id) 
                                                ? 'ring-2 ring-blue-500 ring-offset-2' 
                                                : 'hover:ring-2 hover:ring-blue-200 hover:ring-offset-2'
                                            }
                                        `}
                                    >
                                        {selectedAssets.includes(asset.id) && (
                                            <div className="absolute top-2 left-2 z-20 bg-blue-500 rounded-full p-1">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="aspect-video relative">
                                            {asset.type === 'image' ? (
                                                <img 
                                                    src={asset.url} 
                                                    alt={asset.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <video 
                                                        src={asset.url}
                                                        className="w-full h-full object-cover"
                                                        onLoadedMetadata={(e) => {
                                                            asset.duration = e.target.duration;
                                                        }}
                                                    />
                                                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                                        <Clock className="inline-block w-3 h-3 mr-1" />
                                                        {Math.floor(asset.duration || 0)}s
                                                    </div>
                                                </>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end p-3">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="text-white text-xs">
                                                        <HardDrive className="inline-block w-3 h-3 mr-1" />
                                                        {formatFileSize(asset.size || 0)}
                                                    </div>
                                                    <Menu shadow="md" position="bottom-end">
                                                        <Menu.Target>
                                                            <ActionIcon variant="filled" size="sm" className="!bg-white/20 hover:!bg-white/40">
                                                                <MoreVertical size={14} className="text-white" />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item leftSection={<Download size={14} />}>
                                                                Download
                                                            </Menu.Item>
                                                            <Menu.Item 
                                                                leftSection={<Trash2 size={14} />}
                                                                color="red"
                                                            >
                                                                Delete
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <Text size="sm" className="font-medium truncate">
                                                {asset.name}
                                            </Text>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SecondaryToolbar;
