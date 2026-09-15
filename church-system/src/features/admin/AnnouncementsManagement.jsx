'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Trash2,
  SendHorizontal,
  Bot,
  Users,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { useLanguage } from '../../hooks/useLanguage';

const AnnouncementsManagement = () => {
  const { isAmharic } = useLanguage();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [broadcastToTelegram, setBroadcastToTelegram] = useState(true);
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [botStatus, setBotStatus] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiFetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Announcements fetch error:', err);
    } finally {
      setFetching(false);
    }
  };

  const fetchBotStatus = async () => {
    try {
      const res = await apiFetch('/api/telegram/status');
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data);
      }
    } catch (err) {
      console.warn('Bot status fetch error:', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchBotStatus();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('ርዕስ እና መልእክት ያስፈልጋሉ');
      return;
    }

    setLoading(true);
    try {
      // 1. Post to web announcement system
      const res = await apiFetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });

      if (res.ok) {
        // 2. If broadcast to Telegram is checked, broadcast via Telegram Bot API
        if (broadcastToTelegram && botStatus?.isRunning) {
          try {
            const tgText = `📢 *${title.trim()}*\n\n${message.trim()}\n\n🏛️ _ተክለ ሳዊሮስ ሰንበት ት/ቤት_`;
            await apiFetch('/api/telegram/broadcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: tgText }),
            });
            toast.success('ማስታወቂያው በድረ-ገጹና በቴሌግራም ቦት በተሳካ ሁኔታ ተሰራጭቷል! 📢');
          } catch (e) {
            toast.success('ማስታወቂያው በድረ-ገጽ ተለጥፏል!');
          }
        } else {
          toast.success('ማስታወቂያው በተሳካ ሁኔታ ተልኳል!');
        }

        setTitle('');
        setMessage('');
        fetchAnnouncements();
        fetchBotStatus();
      } else {
        toast.error('ማስታወቂያውን መላክ አልተቻለም።');
      }
    } catch (err) {
      toast.error('የአውታረ መረብ ስህተት ተከሰቷል።');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('ይህን ማስታወቂያ መሰረዝ ይፈልጋሉ?')) return;
    try {
      const res = await apiFetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ማስታወቂያው ተሰርዟል');
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (e) {
      toast.error('መሰረዝ አልተቻለም');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="ማስታወቂያዎችና የቴሌግራም ስርጭት"
        subtitle="ለተማሪዎች፣ መምህራንና ምእመናን በድረ-ገጽ እና በቴሌግራም ቦት ይፋዊ ማስታወቂያ ያስተላልፉ"
        icon={Bell}
        badge={<Badge variant="gold" size="sm">ሕዝባዊ መልእክት</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => { fetchAnnouncements(); fetchBotStatus(); }} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>አድስ</span>
          </Button>
        }
      />

      {/* Grid: Create Announcement + Telegram Bot Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="default" padding="lg" className="space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <SendHorizontal className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>አዲስ ማስታወቂያ ይለጥፉ (Publish Announcement)</span>
            </h3>

            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  የማስታወቂያው ርዕስ *
                </label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ምሳሌ፡ የዘመነ ጽጌ የትምህርት መርሐግብር ማስታወቂያ..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  የማስታወቂያው ዝርዝር መልእክት *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border-slate-200 dark:border-slate-800 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all leading-relaxed"
                  placeholder="የማስታወቂያው ሙሉ ዝርዝር መልእክት እዚህ ይፃፉ..."
                />
              </div>

              {/* Telegram Broadcast Checkbox */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={broadcastToTelegram}
                    onChange={(e) => setBroadcastToTelegram(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 rounded-md border-slate-300"
                  />
                  <span>🤖 በቴሌግራም ቦት ለተመዘገቡ ተማሪዎች በሙሉ ይላክ (Broadcast to Telegram)</span>
                </label>
                <Badge variant={botStatus?.isRunning ? 'active' : 'secondary'} size="sm">
                  {botStatus?.isRunning ? 'ቦት ንቁ ነው' : 'ቦት አልተገናኘም'}
                </Badge>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit" loading={loading} className="gap-2 shadow-md">
                  <Send className="w-4 h-4" />
                  <span>ማስታወቂያ አሰራጭ</span>
                </Button>
              </div>
            </form>
          </Card>

          {/* Active Announcements List */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>የተለጠፉ ማስታወቂያዎች ({announcements.length})</span>
              </span>
            </h3>

            {fetching ? (
              <div className="py-8 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">ማስታወቂያዎችን በመጫን ላይ...</p>
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                እስካሁን የተለጠፈ ማስታወቂያ የለም።
              </p>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann._id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ann.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatEthiopianDate(ann.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {ann.content || ann.message}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="ማስታወቂያውን ሰርዝ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Telegram Bot Status & Info Widget */}
        <div className="space-y-6">
          <Card
            variant="default"
            padding="lg"
            className="space-y-4 border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
          >
            <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">የቴሌግራም ቦት (Telegram Bot)</h3>
              </div>
              <Badge variant={botStatus?.isRunning ? 'active' : 'warning'} size="sm">
                {botStatus?.isRunning ? 'ንቁ (Active)' : 'መጠባበቅ ላይ'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">የቦት ስም፦</span>
                <span className="font-bold text-slate-900 dark:text-white">{botStatus?.botName || 'ተክለ ሳዊሮስ ሰንበት ት/ቤት'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">የቴሌግራም አድራሻ፦</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {botStatus?.botUsername ? `@${botStatus.botUsername}` : '@TekleSawirosBot'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">የተገናኙ ተማሪዎች፦</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{botStatus?.linkedStudentsCount ?? 0} ተማሪዎች</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">የተጠቃሚዎች ድምር፦</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{botStatus?.linkedUsersCount ?? 0}</span>
              </div>
            </div>

            {botStatus?.botLink ? (
              <a
                href={botStatus.botLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <span>ቦቱን በቴሌግራም ይክፈቱ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                💡 በ <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">church-server/.env</code> ውስጥ <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">TELEGRAM_BOT_TOKEN</code> ሲገባ ቦቱ በራሱ መስራት ይጀምራል።
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-bold text-slate-700 dark:text-slate-300">🌟 የተካተቱ አገልግሎቶች፦</p>
              <p>• 🎓 የተማሪ ፖርታል (Telegram Mini App)</p>
              <p>• 📅 የዕለታዊ ክትትልና የፈተና ውጤት እይታ</p>
              <p>• 🔍 የሰርተፊኬትና መታወቂያ ማረጋገጫ</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsManagement;