import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google';

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId.includes('your_client_id_here')) {
        return new NextResponse(
            `
      <html>
        <body style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.5;">
          <h1 style="color: #e11d48;">Configuration Error</h1>
          <p>You haven't configured your Google Credentials yet.</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
            <strong>To fix this:</strong>
            <ol>
              <li>Open the file <code>.env.local</code> in your project folder.</li>
              <li>Replace <code>your_client_id_here</code> and <code>your_client_secret_here</code> with your real keys from Google Cloud Console.</li>
              <li>Restart the application (close the black window and run <code>run_app.bat</code> again).</li>
            </ol>
          </div>
          <br>
          <a href="/" style="color: #2563eb; text-decoration: none;">&larr; Back to Dashboard</a>
        </body>
      </html>
      `,
            {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            }
        );
    }

    const url = getAuthUrl();
    return NextResponse.redirect(url);
}
