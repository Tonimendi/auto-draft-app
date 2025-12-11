import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { oauth2Client } from '@/lib/google';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info to identify them
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo.data.email;

        if (!email) {
            throw new Error('Could not get email from profile');
        }

        // Save tokens to DB
        const user: any = {
            email,
            refresh_token: tokens.refresh_token || '', // Handle missing refresh token
            access_token: tokens.access_token || '',
            expiry_date: tokens.expiry_date || 0
        };

        // If we only got an access_token (re-auth), try to merge with existing user to keep the refresh token
        const existingUser = db.getUser(email);
        if (existingUser && !user.refresh_token) {
            user.refresh_token = existingUser.refresh_token;
        }

        db.saveUser(user);

        // Redirect back to dashboard with success
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.delete('code');
        url.searchParams.set('connected', 'true');
        url.searchParams.set('email', email);

        return NextResponse.redirect(url);

    } catch (error) {
        console.error('Auth Error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
