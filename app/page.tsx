"use client";

import { useState } from "react";

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [selectedDraft, setSelectedDraft] = useState<any>(null); // For modal

    // Auth Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [authStatus, setAuthStatus] = useState("idle"); // idle, saving, saved, error
    const [errorMessage, setErrorMessage] = useState("");

    const handleSaveAuth = async () => {
        setAuthStatus("saving");
        setErrorMessage("");
        try {
            const res = await fetch('/api/auth/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, app_password: password, api_key: apiKey })
            });
            const data = await res.json();

            if (res.ok) {
                setAuthStatus("saved");
            } else {
                setAuthStatus("error");
                setErrorMessage(data.error || "Unknown Error");
            }
        } catch (e: any) {
            setAuthStatus("error");
            setErrorMessage(e.message || "Network Error");
        }
    };

    const handleSync = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/sync', { method: 'POST' });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
            setResult({ error: "Failed to sync" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-50 relative">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <h1 className="text-4xl font-bold text-gray-900">Auto-Draft AI</h1>
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">Mode: Standalone</span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-8 w-full max-w-2xl">

                {/* Auth Section */}
                <div className="bg-white p-8 rounded-xl shadow-lg w-full border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-6">1. Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gmail Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                placeholder="you@gmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">App Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                placeholder="xxxx xxxx xxxx xxxx"
                            />
                            <p className="text-xs text-gray-400 mt-1">Get this from Google Account &gt; Security &gt; App Passwords</p>
                        </div>

                        {/* NEW: API Key Field */}
                        <div className="pt-4 border-t">
                            <label className="block text-sm font-medium text-purple-700">Gemini API Key (Optional)</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border bg-purple-50"
                                placeholder="AIzaSy..."
                            />
                            <p className="text-xs text-gray-400 mt-1">Get free from: <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline text-blue-600">Google AI Studio</a></p>
                        </div>

                        <button
                            onClick={handleSaveAuth}
                            className={`w-full px-4 py-2 rounded transition disabled:opacity-50 ${authStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 hover:bg-slate-900'} text-white`}
                            disabled={!email || !password || authStatus === 'saved'}
                        >
                            {authStatus === 'saving' ? 'Saving...' :
                                authStatus === 'saved' ? 'Saved Credentials ✅' :
                                    authStatus === 'error' ? 'Retry Save' : 'Save Credentials'}
                        </button>
                        {errorMessage && <p className="text-red-500 text-xs mt-2 text-center font-bold">{errorMessage}</p>}
                    </div>
                </div>

                {/* Action Section */}
                <div className="bg-white p-8 rounded-xl shadow-lg w-full border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-6">2. Actions</h2>
                    <button
                        className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
                        onClick={handleSync}
                        disabled={loading}
                    >
                        {loading ? 'Analyzing & Drafting...' : 'Run Auto-Draft'}
                    </button>
                </div>

                {result && (
                    <div className="bg-white p-8 rounded-xl shadow-lg w-full border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-bold mb-4">Results</h3>

                        {result.error ? (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg">{result.error}</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-gray-600 border-b pb-2">
                                    <span>Learned from: <strong>{result.learnedFrom || 0} emails</strong> (Context Updated)</span>
                                    <span>Drafts created: <strong>{result.draftsCreated ? result.draftsCreated.length : 0}</strong></span>
                                </div>

                                {/* DEBUG LOGS */}
                                {result.logs && result.logs.length > 0 && (
                                    <div className="bg-slate-900 text-slate-300 p-3 rounded text-xs font-mono overflow-auto max-h-32">
                                        <p className="font-bold text-white mb-1">Process Log:</p>
                                        {result.logs.map((log: string, idx: number) => (
                                            <div key={idx} className="truncate">{log}</div>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {result.draftsCreated && result.draftsCreated.map((draft: any, i: number) => {
                                        const isError = draft.body && draft.body.startsWith("[ERROR");
                                        return (
                                            <div
                                                key={i}
                                                className={`p-4 rounded border hover:shadow transition cursor-pointer ${isError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}
                                                onClick={() => setSelectedDraft(draft)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className={`font-semibold ${isError ? 'text-red-700' : 'text-gray-800'}`}>{draft.subject}</div>
                                                    <span className={`text-xs px-2 py-1 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-gray-200'}`}>
                                                        {isError ? 'ERROR' : 'View Full'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mb-2">To: {draft.to}</div>
                                                <div className={`text-sm italic truncate ${isError ? 'text-red-600 font-medium' : 'text-gray-600'}`}>"{draft.preview}"</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal for Full Draft */}
            {
                selectedDraft && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="text-xl font-bold">Draft Preview</h3>
                                <button onClick={() => setSelectedDraft(null)} className="text-gray-500 hover:text-black">✕</button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 whitespace-pre-wrap font-sans text-sm">
                                {selectedDraft.body || selectedDraft.preview}
                            </div>
                            <div className="p-6 border-t bg-gray-50 flex justify-end">
                                <button onClick={() => setSelectedDraft(null)} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Close</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </main >
    );
}
