import { NextRequest, NextResponse } from 'next/server';
import { cleanupInactiveUsers } from '@/lib/firebase-admin';

const API_KEY = process.env.CLEANUP_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await cleanupInactiveUsers();

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