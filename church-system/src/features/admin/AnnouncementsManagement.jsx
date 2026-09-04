'use client';

import React, { useState } from 'react';
import { Bell, Send } from 'lucide-react';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';

const AnnouncementsManagement = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });

      if (res.ok) {
        toast.success('ማስታወቂያው በስኬት ተልኳል! (Announcement posted!)');
        setTitle('');
        setMessage('');
      } else {
        toast.error('ማስታወቂያውን መላክ አልተቻለም።');
      }
    } catch (err) {
      toast.error('የአውታረ መረብ ስህተት ተከሰቷል።');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ማስታወቂያዎች (Announcements)"
        subtitle="ለተማሪዎች፣ መምህራን እና ምእመናን ይፋዊ ማስታወቂያ ያስተላልፉ"
        icon={Bell}
        badge={<Badge variant="gold" size="sm">ሕዝባዊ መልእክት</Badge>}
      />

      <Card variant="default" padding="md" className="max-w-2xl">
        <form onSubmit={handlePostAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              ርዕስ (Title)
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="የማስታወቂያው ርዕስ..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              መልእክት (Message)
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border-slate-200 dark:border-slate-800 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
              placeholder="የማስታወቂያው ዝርዝር..."
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" type="submit" loading={loading} className="gap-2">
              <Send className="w-4 h-4" />
              <span>ማስታወቂያ ላክ (Post Announcement)</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AnnouncementsManagement;