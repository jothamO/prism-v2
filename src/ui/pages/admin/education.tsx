// =====================================================
// PRISM V2 - Admin Education Page
// Manage education center articles
// =====================================================

import { useState, useEffect } from 'react';
import { Card, Button, Input, SearchInput, Select } from '@/ui/components';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Article = Tables<'education_articles'>;

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
        try {
            const { data, error } = await supabase
                .from('education_articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setArticles(data || []);
        } catch (error) {
            console.error('Failed to load articles:', error);
            toast.error('Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title || !form.slug || !form.category) {
            toast.error('Please fill in required fields');
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('education_articles')
                    .update({
                        title: form.title,
                        slug: form.slug,
                        description: form.description,
                        category: form.category,
                        read_time: form.read_time,
                        content: form.content,
                        is_published: form.is_published,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingId);

                if (error) throw error;
                toast.success('Article updated');
            } else {
                const { error } = await supabase
                    .from('education_articles')
                    .insert({
                        title: form.title,
                        slug: form.slug,
                        description: form.description,
                        category: form.category,
                        read_time: form.read_time,
                        content: form.content,
                        is_published: form.is_published,
                    });

                if (error) throw error;
                toast.success('Article created');
            }

            await loadArticles();
            resetForm();
        } catch (error) {
            console.error('Failed to save article:', error);
            toast.error('Failed to save article');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({
            title: '',
            slug: '',
            description: '',
            category: 'basics',
            read_time: '5 min',
            content: '',
            is_published: true,
        });
    };

    const handleEdit = (article: Article) => {
        setForm({
            title: article.title,
            slug: article.slug,
            description: article.description || '',
            category: article.category,
            read_time: article.read_time || '5 min',
            content: article.content || '',
            is_published: article.is_published ?? true,
        });
        setEditingId(article.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this article?')) return;
        
        try {
            const { error } = await supabase
                .from('education_articles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Article deleted');
            await loadArticles();
        } catch (error) {
            console.error('Failed to delete article:', error);
            toast.error('Failed to delete article');
        }
    };

    const handleTogglePublish = async (id: string, published: boolean) => {
        try {
            const { error } = await supabase
                .from('education_articles')
                .update({
                    is_published: published,
                    published_at: published ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;
            await loadArticles();
            toast.success(published ? 'Article published' : 'Article unpublished');
        } catch (error) {
            console.error('Failed to update publish status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredArticles = articles.filter(a =>
        search === '' || a.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Education Articles
                    </h1>
                    <p className="text-muted-foreground">
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
                    <h3 className="font-semibold text-foreground mb-4">
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
                                    className="rounded border-border"
                                />
                                <label className="text-sm text-foreground">Published</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                Content (Markdown)
                            </label>
                            <textarea
                                rows={10}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
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
                <div className="divide-y divide-border">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading...</div>
                    ) : filteredArticles.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No articles found</div>
                    ) : (
                        filteredArticles.map(article => (
                            <div key={article.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <span>📄</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground">{article.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="px-2 py-0.5 bg-muted rounded">{article.category}</span>
                                            <span>{article.read_time}</span>
                                            {!article.is_published && <span className="text-warning">Draft</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleTogglePublish(article.id, !article.is_published)}
                                        className={`px-3 py-1 text-xs rounded-full ${article.is_published ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}
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
