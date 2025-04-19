import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { topic: string } }
) {
  const normalizedTopic = params.topic.replace(/-/g, "_");
  
  try {
    const filePath = path.join(process.cwd(), 'lib', 'content', 'topics', `${normalizedTopic}.json`);
    
    // בדיקה אם הקובץ קיים
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Topic not found', { status: 404 });
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading topic data:", error);
    return new NextResponse('Error loading topic data', { status: 500 });
  }
}