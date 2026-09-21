'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bell,
  Send,
  Trash2,
  SendHorizontal,
  Bot,
  Users,
  ExternalLink,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Moon,
  Sun,
  Clock,
  Search,
  X,
  Copy,
  Hash,
  Share2,
  UserCheck,
  Megaphone,
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
  { value: 'Distance', labelAm: 'የርቀት ተማሪዎች (Distance)', labelEn: 'Distance Students' },
];

const SHIFT_OPTIONS = [
  { value: 'all', labelAm: 'ሁሉም ፈረቃዎች (All Shifts)', labelEn: 'All Shifts' },
  { value: 'weekend', labelAm: '☀️ የቀን / ቅዳሜና እሑድ', labelEn: 'Day / Weekend' },
  { value: 'night', labelAm: '🌙 የማታ ፈረቃ', labelEn: 'Night Shift' },
];

const AnnouncementsManagement = () => {
  const { isAmharic } = useLanguage();
  const [activeTab, setActiveTab] = useState('groups'); // 'announcements' | 'groups'

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

  // --- API Calls ---
  const fetchAnnouncements = useCallback(async () => {
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
  }, []);

  const fetchBotStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/api/telegram/status');
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data);
      }
    } catch (err) {
      console.warn('Bot status fetch error:', err);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
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
  }, [groupSearch, filterGroupGrade, filterGroupShift]);

  useEffect(() => {
    fetchAnnouncements();
    fetchBotStatus();
    fetchGroups();
  }, [fetchAnnouncements, fetchBotStatus, fetchGroups]);

  // Derived filtered groups for instant in-memory search responsiveness
  const displayedGroups = useMemo(() => {
    if (!groupSearch.trim()) return groups;
    const query = groupSearch.toLowerCase().trim();
    return groups.filter(
      (g) =>
        (g.title && g.title.toLowerCase().includes(query)) ||
        (g.chatId && String(g.chatId).includes(query)) ||
        (g.assignedGrade && g.assignedGrade.toLowerCase().includes(query))
    );
  }, [groups, groupSearch]);

  const totalMembersCount = useMemo(() => {
    return groups.reduce((sum, g) => sum + (Number(g.memberCount) || 0), 0);
  }, [groups]);

  // --- Handlers ---
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('ርዕስ እና መልእክት ያስፈልጋሉ (Title and message required)');
      return;
    }

    if (!postToWeb && !sendToTelegramGroups && !sendToDirectStudents) {
      toast.error('እባክዎ ቢያንስ አንድ የስርጭት መስመር ይምረጡ (ድረ-ገጽ ወይም ቴሌግራም)');
      return;
    }

    setLoading(true);
    let webSuccess = false;

    try {
      if (postToWeb) {
        const res = await apiFetch('/api/admin/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            message: message.trim(),
            targetType: targetingMode === 'grade_shift' && targetGrade !== 'All Classes' ? 'grade' : 'all',
            targetGrade: targetingMode === 'grade_shift' && targetGrade !== 'All Classes' ? targetGrade : undefined,
          }),
        });
        if (res.ok) {
          webSuccess = true;
        } else {
          toast.error('ማስታወቂያውን በድረ-ገጽ መለጠፍ አልተቻለም');
        }
      }

      if (sendToTelegramGroups || sendToDirectStudents) {
        let audienceLabel = '';
        if (targetingMode === 'custom_groups' && selectedGroupIdsForBroadcast.length > 0) {
          audienceLabel = ` 📍 *ለተመረጡ ${selectedGroupIdsForBroadcast.length} ግሩፖች*`;
        } else if (targetGrade && targetGrade !== 'All Classes') {
          const shiftBadge = targetShift === 'night' ? ' (የማታ)' : targetShift === 'weekend' ? ' (የቀን)' : '';
          audienceLabel = ` 📍 *ለ ${targetGrade}${shiftBadge} ተማሪዎች*`;
        } else if (targetShift !== 'all') {
          audienceLabel = targetShift === 'night' ? ' 🌙 *(ለማታ ፈረቃ ተማሪዎች)*' : ' ☀️ *(ለቀን ፈረቃ ተማሪዎች)*';
        }

        const tgText = `📢 *${title.trim()}*${audienceLabel}\n\n${message.trim()}\n\n🏛️ _ተክለ ሳዊሮስ ሰንበት ት/ቤት_`;
        const payload = {
          message: tgText,
          sendToGroups: sendToTelegramGroups,
          sendToDirectStudents: sendToDirectStudents,
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
        if (res.ok && resData.success) {
          toast.success(resData.message || 'ማስታወቂያው ወደ ቴሌግራም በተሳካ ሁኔታ ተልኳል! 📢');
        } else {
          toast.warning(resData.message || 'ማስታወቂያው ወደ ቴሌግራም መላክ አልተቻለም (ቦቱ መስራቱን ያረጋግጡ)');
        }
      }

      if (webSuccess && !sendToTelegramGroups && !sendToDirectStudents) {
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
    setSelectedGroupIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAllGroups = () => {
    if (selectedGroupIds.length === displayedGroups.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(displayedGroups.map((g) => g._id));
    }
  };

  const handleToggleCustomBroadcastGroup = (id) => {
    setSelectedGroupIdsForBroadcast((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
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
        setGroups((prev) => prev.map((g) => (g._id === groupId ? { ...g, assignedGrade: newGrade } : g)));
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
        const shiftLabel = newShift === 'night' ? 'የማታ' : newShift === 'weekend' ? 'የቀን/ቅዳሜ' : 'ሁሉም ፈረቃ';
        toast.success(`የግሩፑ ፈረቃ ወደ ${shiftLabel} ተቀይሯል!`);
        setGroups((prev) => prev.map((g) => (g._id === groupId ? { ...g, shift: newShift } : g)));
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
        toast.success(data.message || 'የቴሌግራም ግሩፖች መረጃ ታድሷል! ✨');
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

  const handleCopyChatId = (chatId) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(String(chatId));
      toast.success(`Chat ID (${chatId}) ተገልብጧል! 📋`);
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
      const payload = { message: directMsgText.trim() };

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
      if (res.ok && data.success) {
        toast.success(data.message || 'መልእክቱ በተሳካ ሁኔታ ተልኳል! 🚀');
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

  // --- Render Helpers ---

  const renderKPIs = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border border-blue-100/50 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden group transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <Users className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate mb-1">
            የተገናኙ ግሩፖች
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {groups.length}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate">ግሩፖች</span>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 border border-purple-100/50 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden group transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <Share2 className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate mb-1">
            ጠቅላላ አባላት
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalMembersCount.toLocaleString()}
            </span>
            <span className="text-xs text-purple-500 font-bold truncate">ተጠቃሚዎች</span>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-white dark:from-slate-800 dark:to-slate-900 border border-emerald-100/50 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden group transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <UserCheck className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate mb-1">
            የተገናኙ ተማሪዎች
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {botStatus?.linkedStudentsCount ?? 0}
            </span>
            <span className="text-xs text-emerald-500 font-bold truncate">በቦቱ</span>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 border border-amber-100/50 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden group transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <Bot className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate mb-1">
            የቴሌግራም ቦት
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex h-3 w-3 relative flex-shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${botStatus?.isRunning ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${botStatus?.isRunning ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {botStatus?.isRunning ? 'ንቁ (Online)' : 'መጠባበቅ ላይ'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center gap-2 w-full max-w-lg border border-slate-200/60 dark:border-slate-700/50 shadow-inner">
      <button
        onClick={() => setActiveTab('groups')}
        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
          activeTab === 'groups'
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
        }`}
      >
        <Bot className="w-4 h-4" />
        <span>የክፍል ግሩፖች (Groups)</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'groups' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
          {groups.length}
        </span>
      </button>

      <button
        onClick={() => setActiveTab('announcements')}
        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
          activeTab === 'announcements'
            ? 'bg-white dark:bg-slate-900 text-[var(--brand-primary)] shadow-sm border border-slate-200/60 dark:border-slate-700'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
        }`}
      >
        <Megaphone className="w-4 h-4" />
        <span>ይፋዊ ማስታወቂያዎች</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'announcements' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
          {announcements.length}
        </span>
      </button>
    </div>
  );

  const renderGroupsTab = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Action & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        {/* Left Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ግሩፕ በስም ወይም በChat ID ፈልግ..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {groupSearch && (
              <button onClick={() => setGroupSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-52 flex-shrink-0">
            <select
              value={filterGroupGrade}
              onChange={(e) => setFilterGroupGrade(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">🎓 ሁሉም ክፍሎች (All Classes)</option>
              {CLASS_GRADE_OPTIONS.filter((o) => o.value !== 'All Classes').map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.labelAm}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-48 flex-shrink-0">
            <select
              value={filterGroupShift}
              onChange={(e) => setFilterGroupShift(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              {SHIFT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.labelAm}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setSelectedGroup(null);
              setModalTargetMode(selectedGroupIds.length > 0 ? 'selected_list' : 'grade_shift');
              setDirectMsgGrade('All Classes');
              setDirectMsgShift('all');
              setShowMessageModal(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {selectedGroupIds.length > 0 ? `ለተመረጡት (${selectedGroupIds.length}) ላክ` : 'መልእክት ላክ'}
            </span>
          </button>

          <button
            onClick={handleSyncGroups}
            disabled={syncingGroups}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="የግሩፖችን ስም እና የአባላት ብዛት ከቴሌግራም ጋር ያመሳስላል"
          >
            <RefreshCw className={`w-4 h-4 ${syncingGroups ? 'animate-spin text-blue-500' : ''}`} />
            <span className="hidden sm:inline">አድስ (Sync)</span>
          </button>
        </div>
      </div>

      {/* Main List Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden relative">
        <div className="p-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/40">
          <div className="flex items-center gap-3">
            {displayedGroups.length > 0 && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedGroupIds.length === displayedGroups.length && displayedGroups.length > 0}
                  onChange={handleSelectAllGroups}
                  className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  ሁሉንም ምረጥ ({displayedGroups.length})
                </span>
              </label>
            )}
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            ጠቅላላ {displayedGroups.length} ከ {groups.length}
          </span>
        </div>

        {fetchingGroups ? (
          <div className="py-20 text-center text-slate-400 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">የቴሌግራም ግሩፖችን በመጫን ላይ...</p>
          </div>
        ) : displayedGroups.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-5 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-500 flex items-center justify-center mx-auto border border-blue-100 dark:border-slate-700 shadow-inner">
              <Bot className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-slate-900 dark:text-white text-lg">
                {groupSearch ? 'ምንም የሚስማማ ግሩፕ አልተገኘም' : 'እስካሁን የተገናኘ የቴሌግራም ግሩፕ የለም'}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {groupSearch ? (
                  'እባክዎ ፍለጋዎን ይቀይሩ ወይም ማጣሪያዎችን ያጽዱ።'
                ) : (
                  <>
                    የሰንበት ት/ቤቱን ይፋዊ ቦት ወደ ክፍል የቴሌግራም ግሩፕዎ ይጨምሩ። ከዚያ በግሩፑ ውስጥ{' '}
                    <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-amber-600">/setclass Grade 7 night</code>{' '}
                    ብለው ሲጽፉ እዚህ ወዲያውኑ ይታያል።
                  </>
                )}
              </p>
            </div>
            {groupSearch && (
              <Button variant="outline" onClick={() => setGroupSearch('')}>
                ፍለጋውን አጽዳ
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayedGroups.map((grp) => {
              const isChecked = selectedGroupIds.includes(grp._id);
              return (
                <div key={grp._id} className={`p-5 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 ${isChecked ? 'bg-blue-50/70 dark:bg-blue-900/10' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'}`}>
                  {/* Left Identity */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleGroupSelection(grp._id)}
                      className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-1 cursor-pointer flex-shrink-0"
                    />
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug break-words">
                          {grp.title}
                        </h4>
                        {grp.shift === 'night' ? (
                          <Badge size="xs" variant="purple"><Moon className="w-3 h-3 mr-1" /> የ ማታ</Badge>
                        ) : grp.shift === 'weekend' ? (
                          <Badge size="xs" variant="success"><Sun className="w-3 h-3 mr-1" /> የቀን/ቅዳሜ</Badge>
                        ) : (
                          <Badge size="xs" variant="neutral">ሁሉም ፈረቃ</Badge>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${grp.isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${grp.isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                          {grp.isActive ? 'ንቁ' : 'ቦዘኔ'}
                        </span>
                        {grp.memberCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                            <Users className="w-3 h-3" /> {grp.memberCount} አባላት
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400 flex-wrap">
                        <button onClick={() => handleCopyChatId(grp.chatId)} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700/50 cursor-pointer group/copy">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />
                          <span>{grp.chatId}</span>
                          <Copy className="w-3 h-3 ml-1 opacity-50 group-hover/copy:opacity-100" />
                        </button>
                        {grp.lastMessageSentAt && (
                          <span className="flex items-center gap-1.5 text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700/50">
                            <Clock className="w-3.5 h-3.5" />
                            <span>የመጨረሻ፦ {formatEthiopianDate(grp.lastMessageSentAt)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Dropdowns */}
                  <div className="flex items-stretch sm:items-center gap-3 flex-wrap sm:flex-nowrap pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex-1 sm:flex-initial sm:w-44 flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">ክፍል (Class)</label>
                      <select value={grp.assignedGrade || 'All Classes'} onChange={(e) => handleUpdateGroupGrade(grp._id, e.target.value)} className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                        {CLASS_GRADE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.labelAm}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 sm:flex-initial sm:w-40 flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">ፈረቃ (Shift)</label>
                      <select value={grp.shift || 'all'} onChange={(e) => handleUpdateGroupShift(grp._id, e.target.value)} className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                        {SHIFT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.labelAm}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end gap-2 pt-4 sm:pt-0">
                      <button onClick={() => { setSelectedGroup(grp); setModalTargetMode('single'); setShowMessageModal(true); }} className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-sm border border-blue-200 dark:border-blue-500/30 transition-all active:scale-95 cursor-pointer">
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">መልእክት</span>
                      </button>
                      <button onClick={() => handleDeleteGroup(grp._id, grp.title)} className="p-2.5 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 transition-all active:scale-95 cursor-pointer" title="ግሩፑን ከሲስተሙ አላቅቅ">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Bulk Action Bar */}
        {selectedGroupIds.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-white/0 dark:from-slate-900 dark:via-slate-900 flex justify-center backdrop-blur-sm pointer-events-none z-10">
            <div className="pointer-events-auto p-4 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex flex-wrap items-center justify-between gap-4 shadow-2xl border border-slate-700/50 w-full max-w-3xl mx-auto animate-slideUp">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center font-black text-sm">
                  {selectedGroupIds.length}
                </div>
                <div>
                  <span className="font-bold text-sm sm:text-base block">ግሩፖች ተመርጠዋል</span>
                  <span className="text-xs text-slate-400">በአንድ ጊዜ መልእክት መላክ ይችላሉ</span>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button onClick={() => setSelectedGroupIds([])} className="py-2 px-4 rounded-xl hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all cursor-pointer">
                  ምርጫውን ሰርዝ
                </button>
                <button onClick={() => { setSelectedGroup(null); setModalTargetMode('selected_list'); setShowMessageModal(true); }} className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
                  <Send className="w-4 h-4" />
                  <span>ለተመረጡት ላክ</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnnouncementsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Left 2 Cols: Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card variant="default" padding="lg" className="space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <SendHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">አዲስ ማስታወቂያ ይለጥፉ</h3>
              <p className="text-sm text-slate-500">ለተማሪዎችና ለክፍል ግሩፖች አዲስ መልእክት ያሰራጩ</p>
            </div>
          </div>

          <form onSubmit={handlePostAnnouncement} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">የማስታወቂያው ርዕስ *</label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ምሳሌ፡ ለሁሉም ተማሪዎች የተላለፈ አስቸኳይ መልእክት..." />
            </div>

            {/* Targeting Selector */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">የተቀባዮች አመራረጥ፦</span>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                  <button type="button" onClick={() => setTargetingMode('grade_shift')} className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${targetingMode === 'grade_shift' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    በክፍልና በፈረቃ
                  </button>
                  <button type="button" onClick={() => setTargetingMode('custom_groups')} className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${targetingMode === 'custom_groups' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    የተመረጡ ግሩፖች ({selectedGroupIdsForBroadcast.length})
                  </button>
                </div>
              </div>

              {targetingMode === 'grade_shift' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዒላማ ክፍል</label>
                    <Select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} options={CLASS_GRADE_OPTIONS.map(o => ({ value: o.value, label: o.labelAm }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዒላማ ፈረቃ</label>
                    <Select value={targetShift} onChange={(e) => setTargetShift(e.target.value)} options={SHIFT_OPTIONS.map(o => ({ value: o.value, label: o.labelAm }))} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
                    <span>የሚላክላቸውን ግሩፖች ይምረጡ፦</span>
                    <button type="button" onClick={() => setSelectedGroupIdsForBroadcast(prev => prev.length === groups.length ? [] : groups.map(g => g._id))} className="text-blue-600 hover:underline cursor-pointer">
                      {selectedGroupIdsForBroadcast.length === groups.length ? 'ሁሉንም ሰርዝ' : 'ሁሉንም ምረጥ'}
                    </button>
                  </div>
                  {groups.length === 0 ? (
                    <p className="text-sm text-center text-slate-400 py-4">እስካሁን የተገናኘ ግሩፕ የለም።</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {groups.map((grp) => (
                        <label key={grp._id} className={`flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer transition-all ${selectedGroupIdsForBroadcast.includes(grp._id) ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={selectedGroupIdsForBroadcast.includes(grp._id)} onChange={() => handleToggleCustomBroadcastGroup(grp._id)} className="w-4 h-4 rounded text-blue-600 cursor-pointer" />
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{grp.title}</span>
                          </div>
                          <Badge size="xs" variant="neutral">{grp.assignedGrade || 'All'}</Badge>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">የማስታወቂያው ዝርዝር መልእክት *</label>
              <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all leading-relaxed custom-scrollbar" placeholder="የማስታወቂያው ሙሉ ዝርዝር መልእክት እዚህ ይፃፉ..." />
            </div>

            {/* Channels */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">የስርጭት መስመሮች፦</span>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                <input type="checkbox" checked={postToWeb} onChange={(e) => setPostToWeb(e.target.checked)} className="w-4.5 h-4.5 rounded text-blue-600 cursor-pointer" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">🌐 በድረ-ገጽ ማስታወቂያ ሰሌዳ ይለጠፍ</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                <input type="checkbox" checked={sendToTelegramGroups} onChange={(e) => setSendToTelegramGroups(e.target.checked)} className="w-4.5 h-4.5 rounded text-blue-600 cursor-pointer" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  👥 ወደ ቴሌግራም ግሩፖች ይላክ
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                <input type="checkbox" checked={sendToDirectStudents} onChange={(e) => setSendToDirectStudents(e.target.checked)} className="w-4.5 h-4.5 rounded text-blue-600 cursor-pointer" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">📱 ለተመዘገቡ ተማሪዎች በግል የቴሌግራም ቦት ይላክ</span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="primary" type="submit" loading={loading} className="gap-2 px-6 py-2.5 text-sm shadow-md">
                <Send className="w-4 h-4" />
                <span>ማስታወቂያ አሰራጭ</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Active Announcements List */}
        <Card variant="default" padding="lg" className="space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>የተለጠፉ ማስታወቂያዎች ({announcements.length})</span>
          </h3>

          {fetching ? (
            <div className="py-10 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">ማስታወቂያዎችን በመጫን ላይ...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
              <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">እስካሁን የተለጠፈ ማስታወቂያ የለም።</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann._id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-4 group hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{ann.title}</h4>
                      {ann.targetGrade && <Badge variant="gold" size="xs">{ann.targetGrade}</Badge>}
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatEthiopianDate(ann.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {ann.message || ann.content}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(ann._id)} className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer" title="ማስታወቂያውን ሰርዝ">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right Col: Bot Status */}
      <div className="space-y-6">
        <Card variant="default" padding="lg" className="border-blue-200/50 dark:border-blue-900/30 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800 dark:to-slate-900 shadow-sm sticky top-6">
          <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">የቴሌግራም ቦት</h3>
            </div>
            <Badge variant={botStatus?.isRunning ? 'active' : 'warning'} size="sm">
              {botStatus?.isRunning ? 'ንቁ (Active)' : 'መጠባበቅ ላይ'}
            </Badge>
          </div>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">የቦት ስም፦</span>
              <span className="font-bold text-slate-900 dark:text-white">{botStatus?.botName || 'ተክለ ሳዊሮስ ሰንበት ት/ቤት'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">የቴሌግራም አድራሻ፦</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{botStatus?.botUsername ? `@${botStatus.botUsername}` : '@TekleSawirosSundaySchoolBot'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">የተገናኙ ግሩፖች፦</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"><Users className="w-4 h-4" /> {botStatus?.connectedGroupsCount ?? groups.length}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">የተገናኙ ተማሪዎች፦</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{botStatus?.linkedStudentsCount ?? 0}</span>
            </div>
          </div>

          {botStatus?.botLink ? (
            <a href={botStatus.botLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95">
              <span>ቦቱን በቴሌግራም ይክፈቱ</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              💡 በ <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded shadow-sm">.env</code> ውስጥ <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded shadow-sm">TELEGRAM_BOT_TOKEN</code> ሲገባ ቦቱ በራሱ መስራት ይጀምራል።
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  const renderMessageModal = () => {
    if (!showMessageModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6 animate-scaleUp">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {modalTargetMode === 'single' && selectedGroup
                    ? `ለ "${selectedGroup.title}" መልእክት መላኪያ`
                    : modalTargetMode === 'selected_list'
                    ? `ለተመረጡ (${selectedGroupIds.length}) ግሩፖች መላኪያ`
                    : 'ለክፍል ቴሌግራም ግሩፖች መላኪያ'}
                </h3>
                <p className="text-sm text-slate-500">መልእክቱ በቀጥታ ወደ ቴሌግራም ይላካል</p>
              </div>
            </div>
            <button onClick={() => setShowMessageModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSendDirectGroupMessage} className="space-y-5">
            {modalTargetMode === 'grade_shift' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">ተቀባይ ክፍል</label>
                  <Select value={directMsgGrade} onChange={(e) => setDirectMsgGrade(e.target.value)} options={CLASS_GRADE_OPTIONS.map(o => ({ value: o.value, label: o.labelAm }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">ተቀባይ ፈረቃ</label>
                  <Select value={directMsgShift} onChange={(e) => setDirectMsgShift(e.target.value)} options={SHIFT_OPTIONS.map(o => ({ value: o.value, label: o.labelAm }))} />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">የመልእክት ጽሑፍ *</label>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{directMsgText.length} ፊደላት</span>
              </div>
              <textarea
                required
                rows={6}
                value={directMsgText}
                onChange={(e) => setDirectMsgText(e.target.value)}
                placeholder="የሚላከውን መልእክት እዚህ ይፃፉ... (*bold*, _italic_ ይደገፋል)"
                className="w-full px-4 py-3 text-sm rounded-2xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all leading-relaxed custom-scrollbar"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setShowMessageModal(false)} className="py-2.5 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer">
                ይቅር
              </button>
              <Button variant="primary" type="submit" loading={sendingDirectMsg} className="gap-2 shadow-md shadow-blue-500/25 px-6 py-2.5">
                <Send className="w-4 h-4" />
                <span>መልእክቱን ላክ 🚀</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
      <PageHeader
        title="ማስታወቂያዎችና የቴሌግራም ግሩፖች"
        subtitle="ለሁሉም ክፍሎች፣ ለተመረጡ ክፍሎች (የቀን/የማታ) ወይም ለተመረጡ የተወሰኑ ግሩፖች መልእክት ያስተላልፉ"
        icon={Megaphone}
        badge={
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>የግንኙነት ማዕከል</span>
          </div>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchAnnouncements();
              fetchBotStatus();
              fetchGroups();
              toast.success('መረጃው ታድሷል! 🔄');
            }}
            className="gap-2 shadow-sm bg-white dark:bg-slate-900 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>አድስ (Refresh)</span>
          </Button>
        }
      />

      {renderKPIs()}
      {renderTabs()}
      
      {activeTab === 'groups' ? renderGroupsTab() : renderAnnouncementsTab()}
      {renderMessageModal()}
    </div>
  );
};

export default AnnouncementsManagement;