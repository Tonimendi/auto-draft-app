import { google } from 'googleapis';
import { oauth2Client } from './google';

export async function getGmailClient(accessToken: string, refreshToken?: string) {
    // Determine if we need to set refresh token. 
    // In a real app, handle token refresh logic if access token is expired.
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function fetchEmails(gmail: any, query: string, maxResults = 10) {
    const res = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
    });
    return res.data.messages || [];
}

export async function getEmailContent(gmail: any, messageId: string) {
    const res = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full' // OR 'raw' if parsing MIME manually
    });

    // Simple extraction logic - in prod use a MIME parser
    const payload = res.data.payload;
    let body = '';

    if (payload.parts) {
        payload.parts.forEach((part: any) => {
            if (part.mimeType === 'text/plain' && part.body.data) {
                body += Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
        });
    } else if (payload.body.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    const headers = payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
    const from = headers.find((h: any) => h.name === 'From')?.value || '';

    return { id: messageId, subject, from, body };
}

export async function createDraft(gmail: any, to: string, subject: string, body: string) {
    // Construct MIME message
    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        ``,
        body
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
            message: {
                raw: encodedMessage
            }
        }
    });
}
