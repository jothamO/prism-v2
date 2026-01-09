// =====================================================
// PRISM V2 - Admin Education Page
// Manage education center articles
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button, Input, SearchInput, Select } from '@/ui/components';

interface Article {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    read_time: string;
    content: string;
    is_published: boolean;
    created_at: string;
}

const CATEGORIES = ['basics', 'vat', 'paye', 'business', 'deductions', 'compliance'];

export function AdminEducation() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: '',
        category: 'basics',
        read_time: '5 min',
        content: '',
        is_published: true,
    });

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        // Table doesn't exist yet - using mock data
        // TODO: Create education_articles table
        setArticles([
            { id: '1', title: 'Understanding VAT in Nigeria', slug: 'what-is-vat', description: 'Learn about VAT', category: 'vat', read_time: '5 min', content: '...', is_published: true, created_at: new Date().toISOString() },
            { id: '2', title: 'EMTL Explained', slug: 'what-is-emtl', description: 'Electronic Money Transfer Levy', category: 'basics', read_time: '3 min', content: '...', is_published: true, created_at: new Date().toISOString() },
        ]);
        setLoading(false);
    };

    const handleSubmit = async () => {
        setSaving(true);
        // TODO: Implement when education_articles table exists
        console.log('Saving article:', form);
        setShowForm(false);
        setEditingId(null);
        setForm({ title: '', slug: '', description: '', category: 'basics', read_time: '5 min', content: '', is_published: true });
        setSaving(false);
    };

    const handleEdit = (article: Article) => {
        setForm({
            title: article.title,
            slug: article.slug,
            description: article.description,
            category: article.category,
            read_time: article.read_time,
            content: article.content,
            is_published: article.is_published,
        });
        setEditingId(article.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this article?')) return;
        // TODO: Implement when education_articles table exists
        console.log('Deleting article:', id);
    };

    const handleTogglePublish = async (id: string, published: boolean) => {
        // TODO: Implement when education_articles table exists
        setArticles(prev => prev.map(a => a.id === id ? { ...a, is_published: published } : a));
    };

    const filteredArticles = articles.filter(a =>
        search === '' || a.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Education Articles
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {articles.length} articles
                    </p>
                </div>
                <Button onClick={() => { setShowForm(true); setEditingId(null); }}>
                    + New Article
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <Card>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        {editingId ? 'Edit Article' : 'New Article'}
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            />
                            <Input
                                label="Slug"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <div className="grid grid-cols-3 gap-4">
                            <Select
                                label="Category"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                options={CATEGORIES.map(c => ({ value: c, label: c.toUpperCase() }))}
                            />
                            <Input
                                label="Read Time"
                                value={form.read_time}
                                onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                            />
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    checked={form.is_published}
                                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                                />
                                <label className="text-sm">Published</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Content (Markdown)
                            </label>
                            <textarea
                                rows={10}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[hsl(240,24%,30%)] bg-gray-50 dark:bg-[hsl(240,24%,26%)] font-mono text-sm"
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button loading={saving} onClick={handleSubmit}>Save Article</Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Search */}
            <div className="max-w-md">
                <SearchInput placeholder="Search articles..." onSearch={setSearch} />
            </div>

            {/* Articles List */}
            <Card className="!p-0 overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-[hsl(240,24%,30%)]">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : filteredArticles.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No articles found</div>
                    ) : (
                        filteredArticles.map(article => (
                            <div key={article.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[hsl(248,80%,36%)]/10 flex items-center justify-center">
                                        <span>📄</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">{article.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{article.category}</span>
                                            <span>{article.read_time}</span>
                                            {!article.is_published && <span className="text-amber-600">Draft</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleTogglePublish(article.id, !article.is_published)}
                                        className={`px-3 py-1 text-xs rounded-full ${article.is_published ? 'bg-[hsl(164,59%,58%)]/10 text-[hsl(164,59%,58%)]' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {article.is_published ? 'Published' : 'Unpublish'}
                                    </button>
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(article)}>✏️</Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(article.id)}>🗑️</Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
