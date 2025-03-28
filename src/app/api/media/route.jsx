import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { MEDIA_ASSETS_TABLE } from "@/config/schema";
import { put } from "@vercel/blob";
import { eq, desc } from "drizzle-orm";

export async function POST(req) {
    try {
        console.log("Starting file upload...");
        const formData = await req.formData();
        const file = formData.get("file");
        const email = formData.get("email");

        if (!file || !email) {
            console.error("Missing required fields");
            return NextResponse.json({ 
                error: "File and email are required" 
            }, { status: 400 });
        }

        console.log("Uploading file:", file.name, "Size:", file.size);

        try {
            if (!process.env.BLOB_READ_WRITE_TOKEN) {
                console.error("BLOB_READ_WRITE_TOKEN is not configured");
                return NextResponse.json({ 
                    error: "Storage configuration error" 
                }, { status: 500 });
            }

            // Upload to blob storage
            const blob = await put(file.name, file, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN
            }).catch(error => {
                console.error("Blob storage error:", error);
                throw new Error(`Blob storage error: ${error.message}`);
            });
            console.log("File uploaded to blob storage:", blob.url);

            // Save to database
            const result = await db.insert(MEDIA_ASSETS_TABLE).values({
                url: blob.url,
                name: file.name,
                type: file.type.startsWith('image/') ? 'image' : 'video',
                createdBy: email,
                size: file.size
            }).returning();
            console.log("Database entry created:", result[0]);

            return NextResponse.json(result[0]);
        } catch (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json({ 
                error: "Failed to upload file", 
                details: uploadError.message 
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Request error:", error);
        return NextResponse.json({ 
            error: "Server error", 
            details: error.message 
        }, { status: 500 });
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    const assets = await db
        .select()
        .from(MEDIA_ASSETS_TABLE)
        .where(eq(MEDIA_ASSETS_TABLE.createdBy, email))
        .orderBy(desc(MEDIA_ASSETS_TABLE.createdAt));

    return NextResponse.json(assets);
}
