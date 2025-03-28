'use client';
import { useState } from 'react';
import EditorSidebar from "../_components/EditorSidebar";
import SecondaryToolbar from "../_components/SecondaryToolbar";

export default function EditorPage({ params }) {
    const [activeTool, setActiveTool] = useState('media'); // Set default to media

    return (
        <div className="flex min-h-screen">
            <EditorSidebar onToolSelect={setActiveTool} />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 flex">
                    <SecondaryToolbar activeTool={activeTool} />
                    <div className="flex-1 bg-slate-50 flex items-center justify-center">
                        <div className="aspect-video bg-slate-900 w-[60%] rounded-lg">
                            {/* Video player will go here */}
                        </div>
                    </div>
                </div>
                
                {/* Timeline Section */}
                <div className="h-48 border-t border-gray-200 bg-white p-4">
                    {/* Timeline content will go here */}
                </div>
            </div>
        </div>
    )
}
