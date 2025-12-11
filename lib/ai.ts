
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateDraft(
    incomingEmail: { from: string, subject: string, body: string },
    pastSentEmails: string[], // Array of body texts
    apiKey?: string
): Promise<string> {

    // 1. Language Detection (Heuristic - Improved)
    const isSpanish = /[áéíóúñ¿]/i.test(incomingEmail.body) ||
        /\b(hola|gracias|saludos|buenos|días|tardes)\b/i.test(incomingEmail.body) ||
        /\b(el|la|de|que|en|por|para|con|un|una|es|lo|su)\b/i.test(incomingEmail.body);

    const language = isSpanish ? 'Spanish' : 'English';
    console.log(`[AI] Detected language: ${language}`);

    // REAL AI MODE
    if (apiKey) {
        console.log("[AI] Using REAL Gemini API...");
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // Using gemini-flash-latest (aliased to 2.5-flash usually)
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            // OPTIMIZATION: Reduce context to 3 examples and truncate to avoid Token Limits (429)
            const examples = pastSentEmails
                .slice(0, 3)
                .map((email, i) => {
                    const snippet = email.length > 800 ? email.substring(0, 800) + "..." : email;
                    return `Example ${i + 1} (My Style):\n${snippet}`;
                })
                .join('\n\n');

            const prompt = `
You are an AI assistant helping me (Toni) reply to emails. 
My goal is to be natural, professional, and concise.
Critically: Mimic my style from the examples. If I am short, be short. If I use emojis, use them.

My Language: ${language}
(REPLY ONLY IN ${language})

My Past Emails (Style Context):
${examples}

---
Incoming Email to Reply To:
From: ${incomingEmail.from}
Subject: ${incomingEmail.subject}
Body:
${incomingEmail.body}

---
Instructions:
1. You MUST draft a reply. Do not skip under any circumstances.
2. If the email seems short or empty, just say "Received, thanks" or something polite.
3. Write the reply body directly. 
4. Do NOT add subject lines or "Dear..." unless I normally do.
5. Sign as "Toni" if I usually sign, otherwise don't.
6. Be natural. No "I hope this email finds you well".
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // FORCE REPLY: We removed the check.
            // if (text.includes("SKIP")) return "skipped";

            return text;

        } catch (error: any) {
            console.error("[AI] Gemini API Failed:", error);
            return `[ERROR: Gemini API Failed]\n\nPlease check your API Key in the dashboard.\n\nDetails: ${error.message || error}`;
        }
    }

    // FALLBACK (Only if NO API Key provided)
    console.log("[AI] No API Key found. Using Fallback.");

    if (isSpanish) {
        return `Hola,\n\nGracias por escribirme sobre "${incomingEmail.subject}".\n\nLe echo un vistazo y te digo algo en cuanto pueda.\n\nSaludos,\nToni`;
    } else {
        return `Hi,\n\nThanks for your email about "${incomingEmail.subject}".\n\nI'll take a look and get back to you soon.\n\nBest,\nToni`;
    }
}
