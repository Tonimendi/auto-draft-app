import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email, app_password, api_key } = await req.json();

        if (!email || !app_password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Save to local JSON or Cloud Redis
        await db.saveUser({
            email,
            app_password,
            api_key: api_key || '',
            // Legacy fields empty
            access_token: '',
            refresh_token: '',
            expiry_date: 0
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Save Auth Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to save' }, { status: 500 });
    }
}
