// =====================================================
// PRISM V2 - Admin Filings Page
// Tax filing management
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button, SearchInput, Select } from '@/ui/components';
import { supabase } from '@/domains/auth/service';
import { formatCurrency } from '@/shared/utils';

interface TaxFiling {
    id: string;
    user_id: string;
    user_email?: string;
    filing_type: 'vat' | 'paye' | 'cit' | 'pit' | 'wht';
    period: string;
    amount: number;
    status: 'draft' | 'pending' | 'submitted' | 'approved' | 'rejected';
    submitted_at?: string;
    created_at: string;
}

export function AdminFilings() {
    const [filings, setFilings] = useState<TaxFiling[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        loadFilings();
    }, [statusFilter, typeFilter]);

    const loadFilings = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('tax_filings')
                .select('*, users(email)')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }
            if (typeFilter !== 'all') {
                query = query.eq('filing_type', typeFilter);
            }

            const { data, error } = await query;
            if (error) throw error;

            setFilings((data ?? []).map(f => ({
                ...f,
                user_email: f.users?.email,
            })));
        } catch (error) {
            console.error('Error loading filings:', error);
            // Mock data
            setFilings([
                { id: '1', user_id: 'u1', user_email: 'john@example.com', filing_type: 'vat', period: '2026-01', amount: 125000, status: 'pending', created_at: new Date().toISOString() },
                { id: '2', user_id: 'u2', user_email: 'jane@example.com', filing_type: 'paye', period: '2026-01', amount: 450000, status: 'submitted', submitted_at: new Date().toISOString(), created_at: new Date().toISOString() },
                { id: '3', user_id: 'u3', user_email: 'bob@example.com', filing_type: 'pit', period: '2025', amount: 1250000, status: 'approved', created_at: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-[hsl(164,59%,58%)]/10 text-[hsl(164,59%,58%)]';
            case 'submitted': return 'bg-blue-100 text-blue-700';
            case 'pending': return 'bg-[hsl(38,100%,58%)]/10 text-[hsl(38,100%,58%)]';
            case 'rejected': return 'bg-[hsl(346,96%,63%)]/10 text-[hsl(346,96%,63%)]';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'vat': return 'VAT';
            case 'paye': return 'PAYE';
            case 'cit': return 'CIT';
            case 'pit': return 'P.I.T.';
            case 'wht': return 'WHT';
            default: return type.toUpperCase();
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await supabase
                .from('tax_filings')
                .update({ status: 'approved' })
                .eq('id', id);
            loadFilings();
        } catch (error) {
            console.error('Error approving filing:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await supabase
                .from('tax_filings')
                .update({ status: 'rejected' })
                .eq('id', id);
            loadFilings();
        } catch (error) {
            console.error('Error rejecting filing:', error);
        }
    };

    const filteredFilings = filings.filter(f =>
        search === '' ||
        f.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        f.period.includes(search)
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tax Filings
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage user tax submissions
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 max-w-md">
                    <SearchInput placeholder="Search by email or period..." onSearch={setSearch} />
                </div>
                <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'draft', label: 'Draft' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'submitted', label: 'Submitted' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'rejected', label: 'Rejected' },
                    ]}
                    className="w-36"
                />
                <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Types' },
                        { value: 'vat', label: 'VAT' },
                        { value: 'paye', label: 'PAYE' },
                        { value: 'pit', label: 'P.I.T.' },
                        { value: 'cit', label: 'CIT' },
                        { value: 'wht', label: 'WHT' },
                    ]}
                    className="w-32"
                />
            </div>

            {/* Filings Table */}
            <Card className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[hsl(240,24%,26%)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Period
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-[hsl(240,24%,30%)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredFilings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No filings found
                                    </td>
                                </tr>
                            ) : (
                                filteredFilings.map(filing => (
                                    <tr key={filing.id} className="hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {filing.user_email ?? 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs bg-[hsl(248,80%,36%)]/10 text-[hsl(248,80%,36%)] rounded-full">
                                                {getTypeLabel(filing.filing_type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {filing.period}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(filing.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(filing.status)}`}>
                                                {filing.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {filing.status === 'submitted' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleApprove(filing.id)}>
                                                        ✓
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleReject(filing.id)}>
                                                        ✕
                                                    </Button>
                                                </div>
                                            )}
                                            {filing.status !== 'submitted' && (
                                                <Button variant="ghost" size="sm">
                                                    View
                                                </Button>
                                            )}
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
