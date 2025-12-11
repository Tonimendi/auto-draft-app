import nodemailer from 'nodemailer';
import imaps from 'imap-simple';

// Helper to find the correct box name
async function openBoxAny(connection: any, candidates: string[]) {
    console.log(`[DEBUG] Trying to open one of these mailboxes: ${candidates.join(', ')}`);
    for (const box of candidates) {
        try {
            await connection.openBox(box);
            console.log(`[DEBUG] SUCCESS: Opened mailbox '${box}'`);
            return box;
        } catch (e) {
            console.log(`[DEBUG] Failed to open '${box}', trying next...`);
        }
    }
    throw new Error(`Could not find any matching mailbox: ${candidates.join(', ')}`);
}

export async function getImapConnection(user: { email: string, app_password?: string }) {
    console.log(`[DEBUG] Connecting to IMAP for user: ${user.email}`);
    if (!user.app_password) throw new Error("Missing App Password");

    const config = {
        imap: {
            user: user.email,
            password: user.app_password,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 15000,
            tlsOptions: { rejectUnauthorized: false }
        }
    };
    try {
        const conn = await imaps.connect(config);
        console.log(`[DEBUG] IMAP Connected Successfully!`);
        return conn;
    } catch (error) {
        console.error(`[DEBUG] IMAP Connection Failed:`, error);
        throw error;
    }
}

export async function fetchSentEmails(user: { email: string, app_password?: string }, limit = 20) {
    console.log(`[DEBUG] Starting fetchSentEmails...`);
    const connection = await getImapConnection(user);
    try {
        // Try common names for "Sent"
        await openBoxAny(connection, ['[Gmail]/Sent Mail', '[Gmail]/Enviados', 'Sent', 'Enviados']);

        // OPTIMIZATION: Only search last 30 days
        const delay = 30 * 24 * 3600 * 1000;
        const dateLimit = new Date();
        dateLimit.setTime(Date.now() - delay);

        console.log(`[DEBUG] Searching for emails since: ${dateLimit.toISOString()}`);
        const searchCriteria = [['SINCE', dateLimit]];

        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: false,
            struct: true
        };

        console.log(`[DEBUG] Executing search...`);
        const messages = await connection.search(searchCriteria, fetchOptions);
        console.log(`[DEBUG] Search found ${messages.length} messages.`);

        const lastMessages = messages.slice(-limit);

        return lastMessages.map(msg => {
            const body = msg.parts.filter((part: any) => part.which === 'TEXT')[0]?.body || '';
            return body;
        });
    } finally {
        console.log(`[DEBUG] Closing connection (Sent).`);
        connection.end();
    }
}

export async function createDraft(user: { email: string, app_password?: string }, to: string, subject: string, body: string) {
    console.log(`[DEBUG] Creating draft for: ${to}`);
    const connection = await getImapConnection(user);
    try {
        const message =
            `From: ${user.email}
To: ${to}
Subject: ${subject}
Content-Type: text/plain; charset="utf-8"

${body}`;

        const boxName = await openBoxAny(connection, ['[Gmail]/Drafts', '[Gmail]/Borradores', 'Drafts', 'Borradores']);

        console.log(`[DEBUG] Appending draft to ${boxName}...`);
        await connection.append(message, { mailbox: boxName, flags: ['\\Draft'] });
        console.log(`[DEBUG] Draft saved.`);

    } finally {
        connection.end();
    }
}

export async function fetchUnreadInbox(user: { email: string, app_password?: string }, limit = 5) {
    console.log(`[DEBUG] Fetching Inbox...`);
    const connection = await getImapConnection(user);
    try {
        // DEBUGGING: List all mailboxes to see where we are
        const boxes = await connection.getBoxes();
        console.log(`[DEBUG] Mailboxes found: ${Object.keys(boxes).join(', ')}`);

        // Use robust opener (English/Spanish/Gmail prefixes)
        await openBoxAny(connection, ['INBOX', 'Inbox', 'Recibidos', '[Gmail]/All Mail', 'All Mail']);
        console.log(`[DEBUG] Inbox opened (Robust).`);

        // STRATEGY: Two-step fetch to handle large inboxes safely WITHOUT date filters

        // DEBUGGING: Forced to fetch ALL emails, ignored read/unread status to prove connection works
        const searchCriteria = ['ALL'];
        const fetchOptionsUID = {
            bodies: ['HEADER.FIELDS (UID)'], // Minimal fetch
            markSeen: false
        };

        console.log(`[DEBUG] Searching all UNSEEN UIDs...`);
        const allUnread = await connection.search(searchCriteria, fetchOptionsUID);
        console.log(`[DEBUG] Found ${allUnread.length} total unread.`);

        if (allUnread.length === 0) return [];

        // 2. Take the LAST 'n' messages (most recent)
        // IMAP searches usually return generic order, but usually ascending UID. 
        // We slice the end.
        const recentMessages = allUnread.slice(-limit);
        const uids = recentMessages.map((m: any) => m.attributes.uid);

        // 3. Fetch Full Bodies for just these UIDs
        console.log(`[DEBUG] Fetching bodies for UIDs: ${uids.join(',')}`);

        // imap-simple doesn't have a direct 'fetch by UIDs' helper that's easy, 
        // so we use the underlying node-imap search again or just search by UID criteria.
        // Easiest: SEARCH [['UID', uids]]

        const fetchCriteria = [['UID', uids]];
        const fetchOptionsBody = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: false
        };

        const messages = await connection.search(fetchCriteria, fetchOptionsBody);

        return messages.map((msg: any) => {
            const headerPart = msg.parts.find((p: any) => p.which === 'HEADER');
            const bodyPart = msg.parts.find((p: any) => p.which === 'TEXT');

            const subject = headerPart?.body?.subject?.[0] || '(No Subject)';
            const from = headerPart?.body?.from?.[0] || '';
            const body = bodyPart?.body || '';

            return { id: msg.attributes.uid, subject, from, body };
        });

    } finally {
        console.log(`[DEBUG] Closing connection (Inbox).`);
        connection.end();
    }
}
