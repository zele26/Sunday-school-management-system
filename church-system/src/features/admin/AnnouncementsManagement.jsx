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
  MessageSquare,
  School,
  Layers,
  Check,
  Globe,
  Radio,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { useLanguage } from '../../hooks/useLanguage';

const CLASS_GRADE_OPTIONS = [
  { value: 'All Classes', labelAm: 'ሁሉም ክፍሎች (All Classes)', labelEn: 'All Classes' },
  { value: 'Grade 7', labelAm: '7ኛ ክፍል (Grade 7)', labelEn: 'Grade 7' },
  { value: 'Grade 8', labelAm: '8ኛ ክፍል (Grade 8)', labelEn: 'Grade 8' },
  { value: 'Grade 9', labelAm: '9ኛ ክፍል (Grade 9)', labelEn: 'Grade 9' },
  { value: 'Grade 10', labelAm: '10ኛ ክፍል (Grade 10)', labelEn: 'Grade 10' },
  { value: 'Grade 11', labelAm: '11ኛ ክፍል (Grade 11)', labelEn: 'Grade 11' },
  { value: 'Grade 12', labelAm: '12ኛ ክፍል (Grade 12)', labelEn: 'Grade 12' },
  { value: 'Distance', labelAm: 'የርቀት ተማሪዎች (Distance / Online)', labelEn: 'Distance Students' },
];

const AnnouncementsManagement = () => {
  const { isAmharic } = useLanguage();
  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'groups'

  // Announcement state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGrade, setTargetGrade] = useState('All Classes');
  const [postToWeb, setPostToWeb] = useState(true);
  const [sendToTelegramGroups, setSendToTelegramGroups] = useState(true);
  const [sendToDirectStudents, setSendToDirectStudents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [botStatus, setBotStatus] = useState(null);

  // Telegram Groups state
  const [groups, setGroups] = useState([]);
  const [fetchingGroups, setFetchingGroups] = useState(false);
  const [syncingGroups, setSyncingGroups] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [filterGroupGrade, setFilterGroupGrade] = useState('all');

  // Quick Message Modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [directMsgGrade, setDirectMsgGrade] = useState('All Classes');
  const [directMsgText, setDirectMsgText] = useState('');
  const [sendingDirectMsg, setSendingDirectMsg] = useState(false);

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

  const fetchGroups = async () => {
    setFetchingGroups(true);
    try {
      let url = '/api/telegram/groups?';
      if (groupSearch.trim()) url += `search=${encodeURIComponent(groupSearch.trim())}&`;
      if (filterGroupGrade && filterGroupGrade !== 'all') url += `grade=${encodeURIComponent(filterGroupGrade)}&`;

      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.warn('Fetch groups error:', err);
    } finally {
      setFetchingGroups(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchBotStatus();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (activeTab === 'groups') {
      fetchGroups();
    }
  }, [activeTab, filterGroupGrade]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('ርዕስ እና መልእክት ያስፈልጋሉ (Title and message required)');
      return;
    }

    setLoading(true);
    try {
      // 1. Post to web announcement system if enabled
      if (postToWeb) {
        await apiFetch('/api/admin/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            message: message.trim(),
            targetType: targetGrade === 'All Classes' ? 'all' : 'grade',
            targetGrade: targetGrade === 'All Classes' ? undefined : targetGrade,
          }),
        });
      }

      // 2. Broadcast to Telegram Groups & Direct Students if enabled
      if ((sendToTelegramGroups || sendToDirectStudents) && botStatus?.isRunning) {
        const gradeBadge = targetGrade && targetGrade !== 'All Classes' ? ` 📍 *ለ ${targetGrade} ተማሪዎች*` : '';
        const tgText = `📢 *${title.trim()}*${gradeBadge}\n\n${message.trim()}\n\n🏛️ _ተክለ ሳዊሮስ ሰንበት ት/ቤት_`;

        const res = await apiFetch('/api/telegram/groups/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: tgText,
            targetGrade: targetGrade === 'All Classes' ? null : targetGrade,
            sendToDirectStudents,
          }),
        });

        const resData = await res.json().catch(() => ({}));
        if (res.ok) {
          toast.success(resData.message || 'ማስታወቂያው ወደ ቴሌግራም ግሩፖች በተሳካ ሁኔታ ተልኳል! 📢');
        } else {
          toast.warning('ማስታወቂያው በድረ-ገጽ ተለጥፏል ነገር ግን ወደ ቴሌግራም መላክ አልተቻለም።');
        }
      } else if (postToWeb) {
        toast.success('ማስታወቂያው በድረ-ገጹ ላይ በተሳካ ሁኔታ ተለጥፏል! 📢');
      }

      setTitle('');
      setMessage('');
      fetchAnnouncements();
      fetchBotStatus();
      fetchGroups();
    } catch (err) {
      toast.error('የአውታረ መረብ ስህተት ተከሰቷል።');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroupGrade = async (groupId, newGrade) => {
    try {
      const res = await apiFetch(`/api/telegram/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedGrade: newGrade }),
      });
      if (res.ok) {
        toast.success(`ግሩፑ ከ ${newGrade} ጋር ተገናኝቷል!`);
        setGroups((prev) =>
          prev.map((g) => (g._id === groupId ? { ...g, assignedGrade: newGrade } : g))
        );
      } else {
        toast.error('የክፍል ምደባ ማሻሻል አልተቻለም');
      }
    } catch (e) {
      toast.error('የግንኙነት ስህተት');
    }
  };

  const handleSyncGroups = async () => {
    setSyncingGroups(true);
    try {
      const res = await apiFetch('/api/telegram/groups/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'ግሩፖች ታድሰዋል');
        fetchGroups();
        fetchBotStatus();
      } else {
        toast.error(data.message || 'ማደስ አልተቻለም');
      }
    } catch (e) {
      toast.error('የግንኙነት ስህተት');
    } finally {
      setSyncingGroups(false);
    }
  };

  const handleDeleteGroup = async (id, title) => {
    if (!confirm(`"${title}" የተባለውን የቴሌግራም ግሩፕ ከሲስተሙ ማላቀቅ ይፈልጋሉ?`)) return;
    try {
      const res = await apiFetch(`/api/telegram/groups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ግሩፑ ተሰርዟል');
        setGroups((prev) => prev.filter((g) => g._id !== id));
        fetchBotStatus();
      } else {
        toast.error('መሰረዝ አልተቻለም');
      }
    } catch (e) {
      toast.error('የግንኙነት ስህተት');
    }
  };

  const handleSendDirectGroupMessage = async (e) => {
    e.preventDefault();
    if (!directMsgText.trim()) {
      toast.error('የመልእክት ጽሑፍ ያስገቡ');
      return;
    }

    setSendingDirectMsg(true);
    try {
      const payload = {
        message: directMsgText.trim(),
        targetGroupId: selectedGroup ? selectedGroup._id : null,
        targetGrade: selectedGroup ? null : (directMsgGrade === 'All Classes' ? null : directMsgGrade),
      };

      const res = await apiFetch('/api/telegram/groups/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'መልእክቱ በተሳካ ሁኔታ ተልኳል!');
        setShowMessageModal(false);
        setDirectMsgText('');
        setSelectedGroup(null);
        fetchGroups();
      } else {
        toast.error(data.message || 'መልእክት መላክ አልተቻለም');
      }
    } catch (err) {
      toast.error('የግንኙነት ስህተት ተከስቷል');
    } finally {
      setSendingDirectMsg(false);
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
        title="ማስታወቂያዎችና የቴሌግራም ክፍል ግሩፖች"
        subtitle="ለተማሪዎችና ለክፍል የቴሌግራም ግሩፖች በክፍል ተለይተው የሚላኩ መልእክቶችን ያስተዳድሩ"
        icon={Bell}
        badge={<Badge variant="gold" size="sm">የግንኙነት ማዕከል</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchAnnouncements();
                fetchBotStatus();
                fetchGroups();
              }}
              className="gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>አድስ</span>
            </Button>
          </div>
        }
      />

      {/* Top Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'announcements'
              ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>ይፋዊ ማስታወቂያዎች (Announcements)</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'groups'
              ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Bot className="w-4 h-4 text-blue-500" />
          <span>የክፍል ቴሌግራም ግሩፖች (Telegram Groups)</span>
          <Badge variant="active" size="xs">
            {groups.length}
          </Badge>
        </button>
      </div>

      {activeTab === 'announcements' ? (
        /* Grid: Create Announcement + Telegram Bot Status */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="default" padding="lg" className="space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <SendHorizontal className="w-5 h-5 text-[var(--brand-primary)]" />
                <span>አዲስ ማስታወቂያ ይለጥፉ (Publish Announcement)</span>
              </h3>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      የማስታወቂያው ርዕስ *
                    </label>
                    <Input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="ምሳሌ፡ የዘመነ ጽጌ የትምህርት መርሐግብር..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      ዒላማ ክፍል (Target Class)
                    </label>
                    <Select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)}>
                      {CLASS_GRADE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.labelAm}
                        </option>
                      ))}
                    </Select>
                  </div>
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

                {/* Distribution Channels */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    የስርጭት መስመሮች (Broadcast Channels)፦
                  </span>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={postToWeb}
                      onChange={(e) => setPostToWeb(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>🌐 በድረ-ገጽ ማስታወቂያ ሰሌዳ ይለጠፍ (Post to Website)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={sendToTelegramGroups}
                      onChange={(e) => setSendToTelegramGroups(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>
                      👥 ወደ <strong className="text-blue-600 dark:text-blue-400">{targetGrade}</strong> የቴሌግራም ግሩፖች ይላክ (Send to Telegram Groups)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={sendToDirectStudents}
                      onChange={(e) => setSendToDirectStudents(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>📱 ለተመዘገቡ ተማሪዎች በግል የቴሌግራም ቦት ይላክ (Direct DM to Students)</span>
                  </label>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ann.title}</h4>
                          {ann.targetGrade && (
                            <Badge variant="gold" size="xs">
                              {ann.targetGrade}
                            </Badge>
                          )}
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
                  <span className="text-slate-500">የተገናኙ የክፍል ግሩፖች፦</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{botStatus?.connectedGroupsCount ?? groups.length} ግሩፖች</span>
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">የተገናኙ ተማሪዎች፦</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {botStatus?.linkedStudentsCount ?? 0} ተማሪዎች
                  </span>
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
                <p className="font-bold text-slate-700 dark:text-slate-300">🌟 የክፍል ግሩፕ አገልግሎት፦</p>
                <p>• 👥 በክፍል ለተመደቡ ግሩፖች ቀጥታ መልእክት መላክ</p>
                <p>• ⚡ በግሩፑ ውስጥ <code className="font-mono text-blue-600">/setclass Grade 7</code> በማለት ማገናኘት</p>
                <p>• 🎓 የተማሪ ፖርታልና የፈተና ውጤት ክትትል</p>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Tab 2: Telegram Groups Management */
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Input
                placeholder="ግሩፕ በስም ፈልግ..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full text-xs"
              />
              <Select
                value={filterGroupGrade}
                onChange={(e) => setFilterGroupGrade(e.target.value)}
                className="w-44 text-xs"
              >
                <option value="all">ሁሉም ክፍሎች</option>
                {CLASS_GRADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelAm}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedGroup(null);
                  setDirectMsgGrade('All Classes');
                  setShowMessageModal(true);
                }}
                className="gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ለክፍል ግሩፕ መልእክት ላክ</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                loading={syncingGroups}
                onClick={handleSyncGroups}
                className="gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingGroups ? 'animate-spin' : ''}`} />
                <span>ግሩፖችን አድስ (Sync)</span>
              </Button>
            </div>
          </div>

          {/* Groups List Table / Cards */}
          <Card variant="default" padding="lg" className="space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>የተገናኙ የቴሌግራም ግሩፖች ({groups.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                ቦቱ በተጨመረባቸው ግሩፖች ውስጥ <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/setclass Grade 7</code> ብለው መመደብ ይችላሉ።
              </p>
            </div>

            {fetchingGroups ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">ግሩፖችን በመጫን ላይ...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl space-y-3">
                <Bot className="w-10 h-10 text-blue-400 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  እስካሁን የተገናኘ የቴሌግራም ግሩፕ የለም
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  የሰንበት ት/ቤቱን የቴሌግራም ቦት (<code>@{botStatus?.botUsername || 'TekleSawirosBot'}</code>) ወደ ክፍል የቴሌግራም ግሩፕዎ ይጨምሩ። ከዚያ በግሩፑ ውስጥ <code>/setclass Grade 7</code> ብለው ሲጽፉ እዚህ ወዲያውኑ ይታያል።
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {groups.map((grp) => (
                  <div
                    key={grp._id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-3 rounded-xl transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {grp.title}
                        </span>
                        <Badge variant={grp.isActive ? 'active' : 'secondary'} size="xs">
                          {grp.isActive ? 'ንቁ (Active)' : 'ቦዘኔ (Inactive)'}
                        </Badge>
                        {grp.memberCount > 0 && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{grp.memberCount} አባላት</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-mono text-slate-400">
                        Chat ID: {grp.chatId} {grp.lastMessageSentAt && `| የመጨረሻ መልእክት፦ ${formatEthiopianDate(grp.lastMessageSentAt)}`}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-500">ክፍል፦</span>
                        <Select
                          value={grp.assignedGrade || 'All Classes'}
                          onChange={(e) => handleUpdateGroupGrade(grp._id, e.target.value)}
                          className="w-44 text-xs font-semibold"
                        >
                          {CLASS_GRADE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.labelAm}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedGroup(grp);
                          setDirectMsgGrade(grp.assignedGrade || 'All Classes');
                          setShowMessageModal(true);
                        }}
                        className="gap-1.5 text-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                        <span>መልእክት ላክ</span>
                      </Button>

                      <button
                        onClick={() => handleDeleteGroup(grp._id, grp.title)}
                        className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="ግሩፑን አላቅቅ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal: Send Targeted Class Message */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <Card variant="default" padding="lg" className="max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedGroup ? `ለ "${selectedGroup.title}" መልእክት መላኪያ` : 'ለክፍል ቴሌግራም ግሩፖች መልእክት መላኪያ'}
                </h3>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendDirectGroupMessage} className="space-y-4">
              {!selectedGroup && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    ተቀባይ ክፍል (Target Class)
                  </label>
                  <Select value={directMsgGrade} onChange={(e) => setDirectMsgGrade(e.target.value)}>
                    {CLASS_GRADE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.labelAm}
                      </option>
                    ))}
                  </Select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    መልእክቱ ለዚህ ክፍል የተመደቡ የቴሌግራም ግሩፖች በሙሉ ይላካል።
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  የመልእክት ጽሑፍ *
                </label>
                <textarea
                  required
                  rows={6}
                  value={directMsgText}
                  onChange={(e) => setDirectMsgText(e.target.value)}
                  placeholder="የሚላከውን መልእክት እዚህ ይፃፉ..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowMessageModal(false)}>
                  ሰርዝ
                </Button>
                <Button variant="primary" type="submit" loading={sendingDirectMsg} className="gap-2 shadow-md">
                  <Send className="w-4 h-4" />
                  <span>መልእክቱን ላክ</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManagement;