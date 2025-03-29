"use client"
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useRouter, usePathname } from 'next/navigation'
import { useUserDetail } from '@/app/context/UserDetailContext'

export default function EditorLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const { userDetail } = useUserDetail()

    useEffect(() => {
        const createNewVideo = async () => {
            if (!userDetail) return;
            if (pathname !== '/editor') return;
            
            const videoId = uuidv4();
            try {
                const response = await fetch('/api/video', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        videoId,
                        userEmail: userDetail.email
                    })
                });

                if (response.ok) {
                    router.push(`/editor/${videoId}`);
                }
            } catch (error) {
                console.error('Failed to create video:', error);
            }
        };

        createNewVideo();
    }, [userDetail, pathname, router]);

    return <>{children}</>;
}
