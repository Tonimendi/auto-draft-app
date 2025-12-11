import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { fetchSentEmails, fetchUnreadInbox, createDraft } from '@/lib/mail-service';
import { generateDraft } from '@/lib/ai';

export async function POST() {
    try {
        // 1. Get User
        const user = await db.getUser();

        if (!user || !user.app_password) {
            return NextResponse.json({ error: 'Missing Credentials. Please configure them on the dashboard first.' }, { status: 401 });
        }

        // 2. Fetch History (Sent Emails)
        console.log("Fetching sent emails...");
        const sentContext = await fetchSentEmails(user); // Default limit 20
        console.log(`Found ${sentContext.length} sent emails.`);

        // 3. Find New Emails to Draft
        console.log("Fetching inbox...");
        const logs: string[] = []; // Log collector

        // BATCH LIMIT: 2 emails max per run to avoid 10s Timeout on Vercel Free Tier
        const inboxMsgs = await fetchUnreadInbox(user, 2);
        // Note: We can't easily pass the mailbox list back from the helper without changing return type,
        // so we rely on console logs OR if needed, we'll assume it worked if we get here.
        logs.push(`Found ${inboxMsgs.length} new unread emails.`);

        const draftsCreated = [];

        for (let index = 0; index < inboxMsgs.length; index++) {
            const msg = inboxMsgs[index];
            logs.push(`Processing: "${msg.subject}"`);

            try {
                // Generate Draft
                console.log(`[AI] Generating draft using Key: ${user.api_key ? user.api_key.substring(0, 5) + '...' : 'NONE'}`);

                const draftBody = await generateDraft({
                    from: msg.from,
                    subject: msg.subject,
                    body: msg.body
                }, sentContext, user.api_key);

                if (draftBody === 'NO_REPLY_NEEDED') {
                    // This block should theoretically never be reached now
                    const log = `[AI] SKIPPED: "${msg.subject}" (Unexpected)`;
                    console.log(log);
                    logs.push(log);
                    continue;
                }

                // Save to Gmail Drafts
                await createDraft(user, msg.from, `Re: ${msg.subject}`, draftBody);
                logs.push(`[SUCCESS] Draft created for: "${msg.subject}"`);

                draftsCreated.push({
                    id: msg.id,
                    to: msg.from,
                    subject: msg.subject,
                    body: draftBody, // Full body for modal
                    preview: draftBody.substring(0, 100) + '...'
                });

            } catch (err: any) {
                const errLog = `[ERROR] Failed "${msg.subject}": ${err.message}`;
                console.error(errLog);
                logs.push(errLog);
            }
        }

        return NextResponse.json({
            success: true,
            learnedFrom: sentContext.length,
            draftsCreated,
            logs // Return logs to UI
        });

    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
