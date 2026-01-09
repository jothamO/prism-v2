// =====================================================
// PRISM V2 - Admin Compliance Page (Tablet-First)
// Document management with upload and review
// =====================================================

import { useState } from 'react';
import {
    useLegalDocuments,
    useRegulatoryBodies,
    useDocumentReview
} from '@/domains/compliance';
import { Card, SearchInput, Select, Button } from '@/ui/components';

export function AdminCompliance() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

    const { bodies } = useRegulatoryBodies();
    const { documents, loading, refetch } = useLegalDocuments({
        search: search || undefined,
        reviewStatus: statusFilter === 'all' ? undefined : statusFilter as 'pending' | 'approved' | 'rejected',
        limit: 20,
    });
    const { approve, reject, loading: reviewing } = useDocumentReview();

    const handleApprove = async (docId: string) => {
        await approve(docId, 'Approved via admin review');
        setSelectedDoc(null);
        refetch();
    };

    const handleReject = async (docId: string) => {
        await reject(docId, 'Rejected via admin review');
        setSelectedDoc(null);
        refetch();
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Compliance Knowledge
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage legal documents and rules
                    </p>
                </div>
                <Button>
                    + Upload Document
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 max-w-md">
                    <SearchInput
                        placeholder="Search documents..."
                        onSearch={setSearch}
                    />
                </div>
                <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'pending', label: 'Pending Review' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'rejected', label: 'Rejected' },
                    ]}
                    className="w-40"
                />
            </div>

            {/* Regulatory Bodies */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {bodies.map((body) => (
                    <Card key={body.id} hover className="text-center !p-4">
                        <p className="font-bold text-[hsl(248,80%,36%)] dark:text-[hsl(248,36%,53%)]">
                            {body.code}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{body.full_name}</p>
                    </Card>
                ))}
            </div>

            {/* Documents Table */}
            <Card className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[hsl(240,24%,26%)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Document
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Effective
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-[hsl(240,24%,30%)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : documents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No documents found
                                    </td>
                                </tr>
                            ) : (
                                documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {doc.title}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {doc.official_reference ?? 'No reference'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-[hsl(240,24%,26%)] rounded-full">
                                                {doc.document_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${doc.review_status === 'approved'
                                                    ? 'bg-[hsl(164,59%,58%)]/10 text-[hsl(164,59%,58%)]'
                                                    : doc.review_status === 'pending'
                                                        ? 'bg-[hsl(38,100%,58%)]/10 text-[hsl(38,100%,58%)]'
                                                        : 'bg-[hsl(346,96%,63%)]/10 text-[hsl(346,96%,63%)]'
                                                }`}>
                                                {doc.review_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {doc.effective_date ?? '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {doc.review_status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            loading={reviewing && selectedDoc === doc.id}
                                                            onClick={() => {
                                                                setSelectedDoc(doc.id);
                                                                handleApprove(doc.id);
                                                            }}
                                                        >
                                                            ✓
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            loading={reviewing && selectedDoc === doc.id}
                                                            onClick={() => {
                                                                setSelectedDoc(doc.id);
                                                                handleReject(doc.id);
                                                            }}
                                                        >
                                                            ✗
                                                        </Button>
                                                    </>
                                                )}
                                                <Button variant="ghost" size="sm">
                                                    View
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
