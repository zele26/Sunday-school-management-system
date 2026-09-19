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
  Moon,
  Sun,
  Clock,
  CheckSquare,
  Square,
  ListFilter,
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

const SHIFT_OPTIONS = [
  { value: 'all', labelAm: 'ሁሉም ፈረቃዎች (All Shifts)', labelEn: 'All Shifts' },
  { value: 'weekend', labelAm: '☀️ የቀን / ቅዳሜና እሑድ (Weekend/Day)', labelEn: 'Day / Weekend' },
  { value: 'night', labelAm: '🌙 የማታ (Night Shift)', labelEn: 'Night Shift' },
];

const AnnouncementsManagement = () => {
  const { isAmharic } = useLanguage();
  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'groups'

  // Announcement state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetingMode, setTargetingMode] = useState('grade_shift'); // 'grade_shift' | 'custom_groups'
  const [targetGrade, setTargetGrade] = useState('All Classes');
  const [targetShift, setTargetShift] = useState('all');
  const [selectedGroupIdsForBroadcast, setSelectedGroupIdsForBroadcast] = useState([]);
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
  const [filterGroupShift, setFilterGroupShift] = useState('all');
  const [selectedGroupIds, setSelectedGroupIds] = useState([]); // for bulk actions

  // Quick Message Modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [modalTargetMode, setModalTargetMode] = useState('grade_shift'); // 'single' | 'selected_list' | 'grade_shift'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [directMsgGrade, setDirectMsgGrade] = useState('All Classes');
  const [directMsgShift, setDirectMsgShift] = useState('all');
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
        let list = data.groups || [];
        if (filterGroupShift && filterGroupShift !== 'all') {
          list = list.filter((g) => g.shift === filterGroupShift || g.shift === 'all');
        }
        setGroups(list);
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
  }, [activeTab, filterGroupGrade, filterGroupShift]);

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
            targetType: targetingMode === 'grade_shift' && targetGrade !== 'All Classes' ? 'grade' : 'all',
            targetGrade: targetingMode === 'grade_shift' && targetGrade !== 'All Classes' ? targetGrade : undefined,
          }),
        });
      }

      // 2. Broadcast to Telegram Groups & Direct Students if enabled
      if ((sendToTelegramGroups || sendToDirectStudents) && botStatus?.isRunning) {
        let audienceLabel = '';
        if (targetingMode === 'custom_groups' && selectedGroupIdsForBroadcast.length > 0) {
          audienceLabel = ` 📍 *ለተመረጡ ${selectedGroupIdsForBroadcast.length} ግሩፖች*`;
        } else if (targetGrade && targetGrade !== 'All Classes') {
          const shiftBadge = targetShift === 'night' ? ' (የማታ)' : (targetShift === 'weekend' ? ' (የቀን)' : '');
          audienceLabel = ` 📍 *ለ ${targetGrade}${shiftBadge} ተማሪዎች*`;
        } else if (targetShift !== 'all') {
          audienceLabel = targetShift === 'night' ? ' 🌙 *(ለማታ ፈረቃ ተማሪዎች)*' : ' ☀️ *(ለቀን ፈረቃ ተማሪዎች)*';
        }

        const tgText = `📢 *${title.trim()}*${audienceLabel}\n\n${message.trim()}\n\n🏛️ _ተክለ ሳዊሮስ ሰንበት ት/ቤት_`;

        const payload = {
          message: tgText,
          sendToDirectStudents,
        };

        if (targetingMode === 'custom_groups' && selectedGroupIdsForBroadcast.length > 0) {
          payload.targetGroupIds = selectedGroupIdsForBroadcast;
        } else {
          payload.targetGrade = targetGrade === 'All Classes' ? null : targetGrade;
          payload.targetShift = targetShift === 'all' ? null : targetShift;
        }

        const res = await apiFetch('/api/telegram/groups/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
      setSelectedGroupIdsForBroadcast([]);
      fetchAnnouncements();
      fetchBotStatus();
      fetchGroups();
    } catch (err) {
      toast.error('የአውታረ መረብ ስህተት ተከሰቷል።');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGroupSelection = (id) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllGroups = () => {
    if (selectedGroupIds.length === groups.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(groups.map((g) => g._id));
    }
  };

  const handleToggleCustomBroadcastGroup = (id) => {
    setSelectedGroupIdsForBroadcast((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

  const handleUpdateGroupShift = async (groupId, newShift) => {
    try {
      const res = await apiFetch(`/api/telegram/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift: newShift }),
      });
      if (res.ok) {
        const shiftLabel = newShift === 'night' ? 'የማታ' : (newShift === 'weekend' ? 'የቀን/ቅዳሜ' : 'ሁሉም ፈረቃ');
        toast.success(`የግሩፑ ፈረቃ ወደ ${shiftLabel} ተቀይሯል!`);
        setGroups((prev) =>
          prev.map((g) => (g._id === groupId ? { ...g, shift: newShift } : g))
        );
      } else {
        toast.error('የፈረቃ ምደባ ማሻሻል አልተቻለም');
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
        setSelectedGroupIds((prev) => prev.filter((item) => item !== id));
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
      };

      if (modalTargetMode === 'single' && selectedGroup) {
        payload.targetGroupId = selectedGroup._id;
      } else if (modalTargetMode === 'selected_list' && selectedGroupIds.length > 0) {
        payload.targetGroupIds = selectedGroupIds;
      } else {
        payload.targetGrade = directMsgGrade === 'All Classes' ? null : directMsgGrade;
        payload.targetShift = directMsgShift === 'all' ? null : directMsgShift;
      }

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
        setSelectedGroupIds([]);
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
        subtitle="ለሁሉም ክፍሎች፣ ለተመረጡ ክፍሎች (የቀን/የማታ) ወይም ለተመረጡ የተወሰኑ ግሩፖች መልእክት ያስተላልፉ"
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
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    የማስታወቂያው ርዕስ *
                  </label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ምሳሌ፡ ለሁሉም ተማሪዎች የተላለፈ አስቸኳይ መልእክት..."
                  />
                </div>

                {/* Targeting Selector: By Class/Shift vs Custom Selection */}
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      የተቀባዮች አመራረጥ (Targeting Method)፦
                    </span>

                    <div className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setTargetingMode('grade_shift')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          targetingMode === 'grade_shift'
                            ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        በክፍልና በፈረቃ ምረጥ
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetingMode('custom_groups')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          targetingMode === 'custom_groups'
                            ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        የተወሰኑ ግሩፖችን በእጅ ምረጥ ({selectedGroupIdsForBroadcast.length})
                      </button>
                    </div>
                  </div>

                  {targetingMode === 'grade_shift' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
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

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          ዒላማ ፈረቃ (Target Shift)
                        </label>
                        <Select value={targetShift} onChange={(e) => setTargetShift(e.target.value)}>
                          {SHIFT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.labelAm}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ) : (
                    /* Custom Groups Checkbox Picker */
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>የሚላክላቸውን ግሩፖች ይምረጡ፦</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedGroupIdsForBroadcast.length === groups.length) {
                              setSelectedGroupIdsForBroadcast([]);
                            } else {
                              setSelectedGroupIdsForBroadcast(groups.map((g) => g._id));
                            }
                          }}
                          className="text-[var(--brand-primary)] font-bold hover:underline"
                        >
                          {selectedGroupIdsForBroadcast.length === groups.length ? 'ሁሉንም ሰርዝ' : 'ሁሉንም ምረጥ'}
                        </button>
                      </div>

                      {groups.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2">እስካሁን የተገናኘ ግሩፕ የለም።</p>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                          {groups.map((grp) => {
                            const isChecked = selectedGroupIdsForBroadcast.includes(grp._id);
                            return (
                              <label
                                key={grp._id}
                                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer select-none transition-all ${
                                  isChecked
                                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleCustomBroadcastGroup(grp._id)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                  />
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {grp.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <Badge variant="gold" size="xs">
                                    {grp.assignedGrade || 'All Classes'}
                                  </Badge>
                                  {grp.shift === 'night' && (
                                    <span className="text-indigo-600 font-bold">🌙 የማታ</span>
                                  )}
                                  {grp.shift === 'weekend' && (
                                    <span className="text-emerald-600 font-bold">☀️ የቀን</span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
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
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40">
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
                      👥 ወደ {targetingMode === 'custom_groups' ? (
                        <strong className="text-blue-600 dark:text-blue-400">የተመረጡ {selectedGroupIdsForBroadcast.length} ቴሌግራም ግሩፖች</strong>
                      ) : targetGrade === 'All Classes' && targetShift === 'all' ? (
                        <strong className="text-blue-600 dark:text-blue-400">ሁሉም የቴሌግራም ግሩፖች በሙሉ</strong>
                      ) : (
                        <span>
                          <strong className="text-blue-600 dark:text-blue-400">{targetGrade}</strong> (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {targetShift === 'night' ? 'የማታ' : (targetShift === 'weekend' ? 'የቀን' : 'ሁሉም ፈረቃ')}
                          </span>
                          ) ግሩፖች
                        </span>
                      )} ይላክ
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
                    {botStatus?.botUsername ? `@${botStatus.botUsername}` : '@TekleSawirosSundaySchoolBot'}
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

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-slate-300">🌟 የስርጭት አማራጮች፦</p>
                <p className="text-[11px]">• 📢 ለሁሉም ክፍሎችና ፈረቃዎች በሙሉ መላክ</p>
                <p className="text-[11px]">• 🎯 ለተመረጡ ክፍሎችና ፈረቃዎች (የቀን/የማታ) መላክ</p>
                <p className="text-[11px]">• ☑️ የተወሰኑ ግሩፖችን በቼክቦክስ መርጦ መላክ</p>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Tab 2: Telegram Groups Management */
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 max-w-xl flex-wrap sm:flex-nowrap">
              <Input
                placeholder="ግሩፕ በስም ፈልግ..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full text-xs"
              />
              <Select
                value={filterGroupGrade}
                onChange={(e) => setFilterGroupGrade(e.target.value)}
                className="w-44 text-xs font-medium"
              >
                <option value="all">ሁሉም ክፍሎች</option>
                {CLASS_GRADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelAm}
                  </option>
                ))}
              </Select>
              <Select
                value={filterGroupShift}
                onChange={(e) => setFilterGroupShift(e.target.value)}
                className="w-40 text-xs font-medium"
              >
                {SHIFT_OPTIONS.map((opt) => (
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
                  setModalTargetMode(selectedGroupIds.length > 0 ? 'selected_list' : 'grade_shift');
                  setDirectMsgGrade('All Classes');
                  setDirectMsgShift('all');
                  setShowMessageModal(true);
                }}
                className="gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {selectedGroupIds.length > 0
                    ? `ለተመረጡት (${selectedGroupIds.length}) ግሩፖች መልእክት ላክ`
                    : 'ለክፍል ግሩፖች መልእክት ላክ'}
                </span>
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

          {/* Bulk Selection Bar */}
          {selectedGroupIds.length > 0 && (
            <div className="p-3 rounded-2xl bg-blue-500 text-white flex items-center justify-between shadow-md text-xs">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                <span className="font-bold">{selectedGroupIds.length} ግሩፖች ተመርጠዋል</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedGroup(null);
                    setModalTargetMode('selected_list');
                    setShowMessageModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 shadow-xs"
                >
                  ለተመረጡት መልእክት ላክ ✉️
                </button>
                <button
                  onClick={() => setSelectedGroupIds([])}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  ሰርዝ
                </button>
              </div>
            </div>
          )}

          {/* Groups List Table / Cards */}
          <Card variant="default" padding="lg" className="space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                {groups.length > 0 && (
                  <input
                    type="checkbox"
                    checked={selectedGroupIds.length === groups.length && groups.length > 0}
                    onChange={handleSelectAllGroups}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    title="ሁሉንም ምረጥ"
                  />
                )}
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>የተገናኙ የቴሌግራም ግሩፖች ({groups.length})</span>
                </h3>
              </div>
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
                  የሰንበት ት/ቤቱን የቴሌግራም ቦት (<code>@{botStatus?.botUsername || 'TekleSawirosSundaySchoolBot'}</code>) ወደ ክፍል የቴሌግራም ግሩፕዎ ይጨምሩ። ከዚያ በግሩፑ ውስጥ <code>/setclass Grade 7 night</code> ወይም <code>/setclass Grade 7 weekend</code> ብለው ሲጽፉ እዚህ ወዲያውኑ ይታያል።
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {groups.map((grp) => {
                  const isChecked = selectedGroupIds.includes(grp._id);
                  return (
                    <div
                      key={grp._id}
                      className={`py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-3 rounded-xl transition-colors ${
                        isChecked ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleGroupSelection(grp._id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-1 sm:mt-0 cursor-pointer"
                        />

                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {grp.title}
                            </span>

                            {/* Shift Badge */}
                            {grp.shift === 'night' ? (
                              <Badge variant="secondary" size="xs" className="gap-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                                <Moon className="w-3 h-3" />
                                <span>የማታ ፈረቃ</span>
                              </Badge>
                            ) : grp.shift === 'weekend' ? (
                              <Badge variant="secondary" size="xs" className="gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                                <Sun className="w-3 h-3" />
                                <span>የቀን / ቅዳሜ ፈረቃ</span>
                              </Badge>
                            ) : (
                              <Badge variant="neutral" size="xs" className="gap-1">
                                <span>ሁሉም ፈረቃ</span>
                              </Badge>
                            )}

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
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Class selector */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-500">ክፍል፦</span>
                          <Select
                            value={grp.assignedGrade || 'All Classes'}
                            onChange={(e) => handleUpdateGroupGrade(grp._id, e.target.value)}
                            className="w-40 text-xs font-semibold"
                          >
                            {CLASS_GRADE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.labelAm}
                              </option>
                            ))}
                          </Select>
                        </div>

                        {/* Shift selector */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-500">ፈረቃ፦</span>
                          <Select
                            value={grp.shift || 'all'}
                            onChange={(e) => handleUpdateGroupShift(grp._id, e.target.value)}
                            className="w-36 text-xs font-semibold"
                          >
                            {SHIFT_OPTIONS.map((opt) => (
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
                            setModalTargetMode('single');
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
                  );
                })}
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
                  {modalTargetMode === 'single' && selectedGroup
                    ? `ለ "${selectedGroup.title}" መልእክት መላኪያ`
                    : modalTargetMode === 'selected_list'
                    ? `ለተመረጡ (${selectedGroupIds.length}) ግሩፖች መልእክት መላኪያ`
                    : 'ለክፍል ቴሌግራም ግሩፖች መልእክት መላኪያ'}
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
              {modalTargetMode === 'grade_shift' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      ተቀባይ ፈረቃ (Target Shift)
                    </label>
                    <Select value={directMsgShift} onChange={(e) => setDirectMsgShift(e.target.value)}>
                      {SHIFT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.labelAm}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              )}

              {modalTargetMode === 'selected_list' && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
                  <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                    መልእክቱ ለሚከተሉት {selectedGroupIds.length} ግሩፖች ይላካል፦
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    {groups
                      .filter((g) => selectedGroupIds.includes(g._id))
                      .map((g) => (
                        <span
                          key={g._id}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium"
                        >
                          {g.title}
                        </span>
                      ))}
                  </div>
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