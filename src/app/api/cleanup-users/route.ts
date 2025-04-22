import { NextRequest, NextResponse } from 'next/server';
import { cleanupInactiveUsers } from '@/lib/firebase-admin';

// מפתח API בסיסי לאבטחה
const API_KEY = process.env.CLEANUP_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // בדיקת הרשאות
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // הפעלת פונקציית הניקוי
    const result = await cleanupInactiveUsers();

    // שליחת תשובה עם סיכום התוצאות
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in cleanup-users API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cleanup users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 