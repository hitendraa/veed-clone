import { NextResponse } from "next/server"
import { db } from "@/config/db"
import { VIDEO_RAW_TABLE } from "@/config/schema"
import { eq } from "drizzle-orm"

export async function POST(req) {
    try {
        const {videoId, userEmail} = await req.json();
        const result = await db.insert(VIDEO_RAW_TABLE).values({
            videoId: videoId,
            createdBy: userEmail,
            type: 'raw'
        }).returning();

        return NextResponse.json({result});
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { videoId, videoData } = await req.json();
        const existingVideo = await db
            .select()
            .from(VIDEO_RAW_TABLE)
            .where(eq(VIDEO_RAW_TABLE.videoId, videoId))
            .limit(1);

        if (!existingVideo.length) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        const result = await db
            .update(VIDEO_RAW_TABLE)
            .set({ videoData, updatedAt: new Date() })
            .where(eq(VIDEO_RAW_TABLE.videoId, videoId))
            .returning();

        return NextResponse.json({ result });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
    }
}

export async function GET(req) {
    const {searchParams} = new URL(req.url);
    const videoId = searchParams.get('videoId');
    const result = await db.select().from(VIDEO_RAW_TABLE).where(eq(VIDEO_RAW_TABLE.videoId, videoId));

    return NextResponse.json(result[0]);
}