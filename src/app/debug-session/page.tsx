import { auth } from "@/auth";

export default async function DebugPage() {
    const session = await auth();
    return (
        <div className="p-10 bg-black text-green-400 font-mono text-sm min-h-screen">
            <h1 className="text-xl mb-4 text-white">Session Debugger</h1>
            <div className="mb-4">
                <h2 className="text-white mb-2">Current Session Data:</h2>
                <pre className="bg-gray-900 p-4 rounded border border-gray-700 overflow-auto">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>
            <div>
                <p className="text-white mb-2">
                    If this is null, the session cookie is not being received by the Server Component.
                    <br />
                    If this has data, but you cannot access /dashboard, the Middleware is the problem.
                </p>
            </div>
        </div>
    );
}
