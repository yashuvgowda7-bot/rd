import { getDocument } from '@/actions/documents';
import { notFound } from 'next/navigation';
import { ChatInterface } from './chat-interface';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DocumentChatPage(props: PageProps) {
    const params = await props.params;
    const document = await getDocument(params.id);

    if (!document) {
        notFound();
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/dashboard/documents"
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold">{document.title}</h1>
                    <p className="text-sm text-gray-400">Ask questions about this document</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                <ChatInterface documentId={document.id} />
            </div>
        </div>
    );
}
