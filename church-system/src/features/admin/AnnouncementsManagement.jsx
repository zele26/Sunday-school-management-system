'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
                if (res.ok && resData.success !== false) {
                    if (postToWeb) {
                        toast.success('ማስታወቂያው በድረ-ገጽ ተለጥፏል፤ ወደ ቴሌግራም ግሩፖችም ተልኳል! 📢');
                    } else {
                        toast.success(resData.message || 'ማስታወቂያው ወደ ቴሌግራም ግሩፖች በተሳካ ሁኔታ ተልኳል! 📢');
                    }
                } else {
                    toast.warning(resData.message || 'ማስታወቂያው በድረ-ገጽ ተለጥፏል ነገር ግን ወደ ቴሌግራም መላክ አልተቻለም።');
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
        if (selectedGroupIds.length === displayedGroups.length) {
            setSelectedGroupIds([]);
        } else {
            setSelectedGroupIds(displayedGroups.map((g) => g._id));
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
                const shiftLabel = newShift === 'night' ? 'የማታ' : newShift === 'weekend' ? 'የቀን/ቅዳሜ' : 'ሁሉም ፈረቃ';
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
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success !== false) {
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

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
            {/* 🌟 1. Top Page Header */}
            <PageHeader
                title="ማስታወቂያዎችና የቴሌግራም ክፍል ግሩፖች"
                subtitle="ለሁሉም ክፍሎች፣ ለተመረጡ ክፍሎች (የቀን/የማታ) ወይም ለተመረጡ የተወሰኑ ግሩፖች መልእክት ያስተላልፉ"
                icon={Megaphone}
                badge={
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>የግንኙነት ማዕከል</span>
                    </div>
                }
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                fetchAnnouncements();
                                fetchBotStatus();
                                fetchGroups();
                                toast.success('መረጃው ታድሷል! 🔄');
                            }}
                            className="gap-2 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>አድስ (Refresh)</span>
                        </Button>
                    </div>
                }
            />

            {/* 🌟 2. Top Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Connected Groups */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate">
                            የተገናኙ ግሩፖች
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {groups.length}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium truncate">ግሩፖች</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Total Group Members */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate">
                            ጠቅላላ አባላት
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {totalMembersCount.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-purple-500 font-bold truncate">ተጠቃሚዎች</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: Linked Students */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate">
                            የተገናኙ ተማሪዎች
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {botStatus?.linkedStudentsCount ?? 0}
                            </span>
                            <span className="text-[11px] text-emerald-500 font-bold truncate">በቦቱ</span>
                        </div>
                    </div>
                </div>

                {/* Card 4: Bot Live Status */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate">
                            የቴሌግራም ቦት
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                                <span
                                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${botStatus?.isRunning ? 'bg-emerald-400' : 'bg-amber-400'
                                        }`}
                                ></span>
                                <span
                                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${botStatus?.isRunning ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`}
                                ></span>
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {botStatus?.isRunning ? 'ንቁ (Online)' : 'መጠባበቅ ላይ'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🌟 3. Clean Segmented Navigation Tabs */}
            <div className="bg-slate-100 dark:bg-slate-850 p-1.5 rounded-2xl flex items-center gap-2 max-w-md border border-slate-200/60 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'groups'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-800'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <Bot className="w-4 h-4" />
                    <span>የክፍል ግሩፖች (Groups)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        {groups.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('announcements')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'announcements'
                            ? 'bg-white dark:bg-slate-900 text-[var(--brand-primary)] shadow-sm border border-slate-200/60 dark:border-slate-800'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <Megaphone className="w-4 h-4" />
                    <span>ይፋዊ ማስታወቂያዎች</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        {announcements.length}
                    </span>
                </button>
            </div>

            {/* 🌟 4. TAB 1: TELEGRAM GROUPS MANAGEMENT */}
            {activeTab === 'groups' ? (
                <div className="space-y-4">
                    {/* Action & Filter Toolbar */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
                        {/* Left Filter Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                            {/* Search Box */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="ግሩፕ በስም ወይም በChat ID ፈልግ..."
                                    value={groupSearch}
                                    onChange={(e) => setGroupSearch(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                {groupSearch && (
                                    <button
                                        onClick={() => setGroupSearch('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Class Filter */}
                            <div className="w-full sm:w-48 flex-shrink-0">
                                <select
                                    value={filterGroupGrade}
                                    onChange={(e) => setFilterGroupGrade(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="all">🎓 ሁሉም ክፍሎች (All Classes)</option>
                                    {CLASS_GRADE_OPTIONS.filter((o) => o.value !== 'All Classes').map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.labelAm}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Shift Filter */}
                            <div className="w-full sm:w-44 flex-shrink-0">
                                <select
                                    value={filterGroupShift}
                                    onChange={(e) => setFilterGroupShift(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    {SHIFT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.labelAm}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Right Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => {
                                    setSelectedGroup(null);
                                    setModalTargetMode(selectedGroupIds.length > 0 ? 'selected_list' : 'grade_shift');
                                    setDirectMsgGrade('All Classes');
                                    setDirectMsgShift('all');
                                    setShowMessageModal(true);
                                }}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-98 cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>
                                    {selectedGroupIds.length > 0
                                        ? `ለተመረጡት (${selectedGroupIds.length}) መልእክት ላክ`
                                        : 'ለክፍል ግሩፖች መልእክት ላክ'}
                                </span>
                            </button>

                            <button
                                onClick={handleSyncGroups}
                                disabled={syncingGroups}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                                title="የግሩፖችን ስም እና የአባላት ብዛት ከቴሌግራም ጋር ያመሳስላል"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${syncingGroups ? 'animate-spin text-blue-500' : ''}`} />
                                <span className="hidden sm:inline">ግሩፖችን አድስ (Sync)</span>
                            </button>
                        </div>
                    </div>

                    {/* Floating Bulk Selection Toolbar */}
                    {selectedGroupIds.length > 0 && (
                        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-xl border border-blue-500/30 animate-fadeIn">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center font-black text-xs">
                                    {selectedGroupIds.length}
                                </div>
                                <div>
                                    <span className="font-bold text-xs sm:text-sm text-white block">
                                        {selectedGroupIds.length} ግሩፖች ተመርጠዋል
                                    </span>
                                    <span className="text-[11px] text-slate-300">
                                        የተመረጡትን ግሩፖች በአንድ ጊዜ መልእክት መላክ ይችላሉ
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button
                                    onClick={() => {
                                        setSelectedGroup(null);
                                        setModalTargetMode('selected_list');
                                        setShowMessageModal(true);
                                    }}
                                    className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>ለተመረጡት መልእክት ላክ</span>
                                </button>
                                <button
                                    onClick={() => setSelectedGroupIds([])}
                                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all active:scale-98 cursor-pointer"
                                >
                                    ምርጫውን ሰርዝ
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Groups Main Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                        {/* Header / Select All */}
                        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/40">
                            <div className="flex items-center gap-3">
                                {displayedGroups.length > 0 && (
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedGroupIds.length === displayedGroups.length && displayedGroups.length > 0
                                            }
                                            onChange={handleSelectAllGroups}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            ሁሉንም ምረጥ ({displayedGroups.length})
                                        </span>
                                    </label>
                                )}
                            </div>

                            <span className="text-[11px] font-bold text-slate-400">
                                ጠቅላላ {displayedGroups.length} ከ {groups.length} ግሩፖች
                            </span>
                        </div>

                        {/* List Body */}
                        {fetchingGroups ? (
                            <div className="py-16 text-center text-slate-400 space-y-3">
                                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs font-medium">የቴሌግራም ግሩፖችን በመጫን ላይ...</p>
                            </div>
                        ) : displayedGroups.length === 0 ? (
                            <div className="text-center py-16 px-6 space-y-4 max-w-lg mx-auto">
                                <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-slate-800 text-blue-500 flex items-center justify-center mx-auto border border-blue-100 dark:border-slate-700 shadow-inner">
                                    <Bot className="w-8 h-8" />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="font-black text-slate-900 dark:text-white text-base">
                                        {groupSearch ? 'ምንም የሚስማማ ግሩፕ አልተገኘም' : 'እስካሁን የተገናኘ የቴሌግራም ግሩፕ የለም'}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {groupSearch ? (
                                            'እባክዎ ፍለጋዎን ይቀይሩ ወይም ማጣሪያዎችን ያጽዱ።'
                                        ) : (
                                            <>
                                                የሰንበት ት/ቤቱን ይፋዊ ቦት (
                                                <code className="font-mono bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                    @{botStatus?.botUsername || 'TekleSawirosSundaySchoolBot'}
                                                </code>
                                                ) ወደ ክፍል የቴሌግራም ግሩፕዎ ይጨምሩ። ከዚያ በግሩፑ ውስጥ{' '}
                                                <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-amber-600">
                                                    /setclass Grade 7 night
                                                </code>{' '}
                                                ብለው ሲጽፉ እዚህ ወዲያውኑ ይታያል።
                                            </>
                                        )}
                                    </p>
                                </div>
                                {groupSearch && (
                                    <button
                                        onClick={() => setGroupSearch('')}
                                        className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                                    >
                                        ፍለጋውን አጽዳ
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {displayedGroups.map((grp) => {
                                    const isChecked = selectedGroupIds.includes(grp._id);
                                    return (
                                        <div
                                            key={grp._id}
                                            className={`p-4 sm:p-5 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${isChecked
                                                    ? 'bg-blue-50/70 dark:bg-blue-950/25'
                                                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-850/50'
                                                }`}
                                        >
                                            {/* Left: Checkbox + Group Identity */}
                                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggleGroupSelection(grp._id)}
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-1 cursor-pointer flex-shrink-0"
                                                />

                                                <div className="space-y-2 flex-1 min-w-0">
                                                    {/* Title & Status Row */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug break-words">
                                                            {grp.title}
                                                        </h4>

                                                        {/* Shift Badge */}
                                                        {grp.shift === 'night' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                                                                <Moon className="w-3 h-3" />
                                                                <span>የማታ ፈረቃ</span>
                                                            </span>
                                                        ) : grp.shift === 'weekend' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                                                <Sun className="w-3 h-3" />
                                                                <span>የቀን / ቅዳሜ ፈረቃ</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                                <span>ሁሉም ፈረቃ</span>
                                                            </span>
                                                        )}

                                                        {/* Active Status Badge */}
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${grp.isActive
                                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${grp.isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                                                                    }`}
                                                            />
                                                            <span>{grp.isActive ? 'ንቁ (Active)' : 'ቦዘኔ (Inactive)'}</span>
                                                        </span>

                                                        {/* Member Count Pill */}
                                                        {grp.memberCount > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg">
                                                                <Users className="w-3 h-3" />
                                                                <span>{grp.memberCount} አባላት</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Subtext: Chat ID + Last Sent Timestamp */}
                                                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 flex-wrap">
                                                        <button
                                                            onClick={() => handleCopyChatId(grp.chatId)}
                                                            className="flex items-center gap-1 hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-700/50 cursor-pointer"
                                                            title="Chat ID ገልብጥ"
                                                        >
                                                            <Hash className="w-3 h-3 text-slate-400" />
                                                            <span>{grp.chatId}</span>
                                                            <Copy className="w-3 h-3 ml-0.5 opacity-60" />
                                                        </button>

                                                        {grp.lastMessageSentAt && (
                                                            <span className="flex items-center gap-1 text-slate-400">
                                                                <Clock className="w-3 h-3" />
                                                                <span>የመጨረሻ መልእክት፦ {formatEthiopianDate(grp.lastMessageSentAt)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Class Assignment Dropdowns & Action Buttons (No Truncation) */}
                                            <div className="flex items-stretch sm:items-center gap-2.5 flex-wrap sm:flex-nowrap pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800/80">
                                                {/* Class Dropdown */}
                                                <div className="flex-1 sm:flex-initial sm:w-44 flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                        ክፍል (Class)
                                                    </label>
                                                    <select
                                                        value={grp.assignedGrade || 'All Classes'}
                                                        onChange={(e) => handleUpdateGroupGrade(grp._id, e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer truncate"
                                                    >
                                                        {CLASS_GRADE_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.labelAm}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Shift Dropdown */}
                                                <div className="flex-1 sm:flex-initial sm:w-36 flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                        ፈረቃ (Shift)
                                                    </label>
                                                    <select
                                                        value={grp.shift || 'all'}
                                                        onChange={(e) => handleUpdateGroupShift(grp._id, e.target.value)}
                                                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer truncate"
                                                    >
                                                        {SHIFT_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.labelAm}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-end gap-1.5 pt-4 sm:pt-0">
                                                    {/* Send Message Button */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedGroup(grp);
                                                            setModalTargetMode('single');
                                                            setShowMessageModal(true);
                                                        }}
                                                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                                                        title="ለዚህ ግሩፕ ብቻ መልእክት ላክ"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                        <span>መልእክት ላክ</span>
                                                    </button>

                                                    {/* Delete / Unlink Button */}
                                                    <button
                                                        onClick={() => handleDeleteGroup(grp._id, grp.title)}
                                                        className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all active:scale-95 cursor-pointer"
                                                        title="ግሩፑን ከሲስተሙ አላቅቅ"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* 🌟 5. TAB 2: BROADCAST ANNOUNCEMENTS MANAGEMENT */
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
                                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            የተቀባዮች አመራረጥ (Targeting Method)፦
                                        </span>

                                        <div className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setTargetingMode('grade_shift')}
                                                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${targetingMode === 'grade_shift'
                                                        ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                                    }`}
                                            >
                                                በክፍልና በፈረቃ ምረጥ
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTargetingMode('custom_groups')}
                                                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${targetingMode === 'custom_groups'
                                                        ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                                    }`}
                                            >
                                                የተወሰኑ ግሩፖችን ምረጥ ({selectedGroupIdsForBroadcast.length})
                                            </button>
                                        </div>
                                    </div>

                                    {targetingMode === 'grade_shift' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                                    ዒላማ ክፍል (Target Class)
                                                </label>
                                                <select
                                                    value={targetGrade}
                                                    onChange={(e) => setTargetGrade(e.target.value)}
                                                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                                >
                                                    {CLASS_GRADE_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.labelAm}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                                    ዒላማ ፈረቃ (Target Shift)
                                                </label>
                                                <select
                                                    value={targetShift}
                                                    onChange={(e) => setTargetShift(e.target.value)}
                                                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                                >
                                                    {SHIFT_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.labelAm}
                                                        </option>
                                                    ))}
                                                </select>
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
                                                    className="text-[var(--brand-primary)] font-bold hover:underline cursor-pointer"
                                                >
                                                    {selectedGroupIdsForBroadcast.length === groups.length
                                                        ? 'ሁሉንም ሰርዝ'
                                                        : 'ሁሉንም ምረጥ'}
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
                                                                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer select-none transition-all ${isChecked
                                                                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800'
                                                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => handleToggleCustomBroadcastGroup(grp._id)}
                                                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                                                    />
                                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                                                        {grp.title}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-1.5 text-[10px] flex-shrink-0">
                                                                    <span className="font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                                                                        {grp.assignedGrade || 'All Classes'}
                                                                    </span>
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
                                <div className="space-y-2.5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        የስርጭት መስመሮች (Broadcast Channels)፦
                                    </span>

                                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 select-none">
                                        <input
                                            type="checkbox"
                                            checked={postToWeb}
                                            onChange={(e) => setPostToWeb(e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                        />
                                        <span>🌐 በድረ-ገጽ ማስታወቂያ ሰሌዳ ይለጠፍ (Post to Website)</span>
                                    </label>

                                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 select-none">
                                        <input
                                            type="checkbox"
                                            checked={sendToTelegramGroups}
                                            onChange={(e) => setSendToTelegramGroups(e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                        />
                                        <span>
                                            👥 ወደ{' '}
                                            {targetingMode === 'custom_groups' ? (
                                                <strong className="text-blue-600 dark:text-blue-400">
                                                    የተመረጡ {selectedGroupIdsForBroadcast.length} ቴሌግራም ግሩፖች
                                                </strong>
                                            ) : targetGrade === 'All Classes' && targetShift === 'all' ? (
                                                <strong className="text-blue-600 dark:text-blue-400">
                                                    ሁሉም የቴሌግራም ግሩፖች በሙሉ
                                                </strong>
                                            ) : (
                                                <span>
                                                    <strong className="text-blue-600 dark:text-blue-400">{targetGrade}</strong> (
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                        {targetShift === 'night'
                                                            ? 'የማታ'
                                                            : targetShift === 'weekend'
                                                                ? 'የቀን'
                                                                : 'ሁሉም ፈረቃ'}
                                                    </span>
                                                    ) ግሩፖች
                                                </span>
                                            )}{' '}
                                            ይላክ
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 select-none">
                                        <input
                                            type="checkbox"
                                            checked={sendToDirectStudents}
                                            onChange={(e) => setSendToDirectStudents(e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
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
                                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        የቴሌግራም ቦት (Telegram Bot)
                                    </h3>
                                </div>
                                <Badge variant={botStatus?.isRunning ? 'active' : 'warning'} size="sm">
                                    {botStatus?.isRunning ? 'ንቁ (Active)' : 'መጠባበቅ ላይ'}
                                </Badge>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">የቦት ስም፦</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {botStatus?.botName || 'ተክለ ሳዊሮስ ሰንበት ት/ቤት'}
                                    </span>
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
                                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                                >
                                    <span>ቦቱን በቴሌግራም ይክፈቱ</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            ) : (
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                                    💡 በ <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">church-server/.env</code> ውስጥ{' '}
                                    <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">TELEGRAM_BOT_TOKEN</code> ሲገባ ቦቱ በራሱ መስራት ይጀምራል።
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
            )}

            {/* 🌟 6. Targeted Class Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                    <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scaleUp">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                                    <Send className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {modalTargetMode === 'single' && selectedGroup
                                            ? `ለ "${selectedGroup.title}" መልእክት መላኪያ`
                                            : modalTargetMode === 'selected_list'
                                                ? `ለተመረጡ (${selectedGroupIds.length}) ግሩፖች መልእክት መላኪያ`
                                                : 'ለክፍል ቴሌግራም ግሩፖች መልእክት መላኪያ'}
                                    </h3>
                                    <p className="text-xs text-slate-400">መልእክቱ በቀጥታ ወደ ቴሌግራም ይላካል</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSendDirectGroupMessage} className="space-y-4">
                            {modalTargetMode === 'grade_shift' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                            ተቀባይ ክፍል (Target Class)
                                        </label>
                                        <select
                                            value={directMsgGrade}
                                            onChange={(e) => setDirectMsgGrade(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            {CLASS_GRADE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.labelAm}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                            ተቀባይ ፈረቃ (Target Shift)
                                        </label>
                                        <select
                                            value={directMsgShift}
                                            onChange={(e) => setDirectMsgShift(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            {SHIFT_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.labelAm}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Message Input */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        የመልእክት ጽሑፍ *
                                    </label>
                                    <span className="text-[11px] font-mono text-slate-400">
                                        {directMsgText.length} ፊደላት
                                    </span>
                                </div>
                                <textarea
                                    required
                                    rows={5}
                                    value={directMsgText}
                                    onChange={(e) => setDirectMsgText(e.target.value)}
                                    placeholder="የሚላከውን መልእክት እዚህ ይፃፉ... (*bold*, _italic_ ይደገፋል)"
                                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-850 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all leading-relaxed"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowMessageModal(false)}
                                    className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                                >
                                    ይቅር
                                </button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    loading={sendingDirectMsg}
                                    className="gap-2 shadow-md"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>መልእክቱን አሁን ላክ 🚀</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsManagement;