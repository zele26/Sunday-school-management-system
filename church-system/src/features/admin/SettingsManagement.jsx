'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Sparkles, Sliders, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';
import { useAdminRegistrationSettings, useUpdateRegistrationSettings } from '../../hooks/queries';

const SettingsManagement = () => {
  const [systemName, setSystemName] = useState('ተክለሳዊሮስ ሰንበት ትምህርት ቤት');
  const [email, setEmail] = useState('contact@teklesawiros.org');
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Registration intake settings
  const { data: regSettings = {}, isLoading: isSettingsLoading } = useAdminRegistrationSettings();
  const updateSettingsMutation = useUpdateRegistrationSettings();

  const [regForm, setRegForm] = useState({
    academicYear: '2017 ዓ.ም',
    generalClosedMessage: '',
    regularClosedMessage: '',
    distanceClosedMessage: '',
  });

  useEffect(() => {
    if (regSettings && regSettings.key) {
      setRegForm({
        academicYear: regSettings.academicYear || '2017 ዓ.ም',
        generalClosedMessage: regSettings.generalClosedMessage || '',
        regularClosedMessage: regSettings.regularClosedMessage || '',
        distanceClosedMessage: regSettings.distanceClosedMessage || '',
      });
    }
  }, [regSettings]);

  const handleGeneralSave = async (e) => {
    e.preventDefault();
    setSavingGeneral(true);
    setTimeout(() => {
      setSavingGeneral(false);
      toast.success('አጠቃላይ ቅንብሮቹ በተሳካ ሁኔታ ተቀምጠዋል!');
    }, 400);
  };

  const handleToggle = (field, currentValue) => {
    updateSettingsMutation.mutate({
      [field]: !currentValue,
    });
  };

  const handleRegSave = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(regForm);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="የሲስተም ቅንብሮችና ማዋቀሪያ"
        subtitle="የሰንበት ትምህርት ቤት ሥርዓት አጠቃላይ መረጃዎችንና የተማሪዎች ምዝገባ ፍሰትን ያስተካክሉ"
        icon={Settings}
        badge={<Badge variant="gold" size="sm">አስተዳደራዊ</Badge>}
      />

      {/* 🎛️ 1. REGISTRATION INTAKE & OPEN/CLOSE CONTROLS */}
      <Card variant="default" padding="md" className="border-2 border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-[#1657b8] dark:text-blue-300 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                የተማሪዎች ምዝገባ መቆጣጠሪያ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                የአዳዲስ ተማሪዎችን መደበኛና የርቀት ምዝገባ ክፍት ወይም ዝግ ያድርጉ
              </p>
            </div>
          </div>
          <Badge variant={regSettings.isRegistrationOpen !== false ? 'approved' : 'rejected'}>
            {regSettings.isRegistrationOpen !== false ? '🟢 ምዝገባ ክፍት ነው' : '🔴 ምዝገባ ተዘግቷል'}
          </Badge>
        </div>

        {/* Quick Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Master Switch */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
            regSettings.isRegistrationOpen !== false
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
          }`}>
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-0.5">አጠቃላይ የምዝገባ በር</span>
              <span className={`text-sm font-black ${
                regSettings.isRegistrationOpen !== false ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {regSettings.isRegistrationOpen !== false ? '🟢 ሙሉ በሙሉ ክፍት' : '🔴 ሙሉ በሙሉ ተዘግቷል'}
              </span>
            </div>
            <Button
              size="sm"
              variant={regSettings.isRegistrationOpen !== false ? 'danger' : 'primary'}
              onClick={() => handleToggle('isRegistrationOpen', regSettings.isRegistrationOpen !== false)}
              disabled={updateSettingsMutation.isPending}
              className="w-full"
            >
              {regSettings.isRegistrationOpen !== false ? 'አጠቃላይ ምዝገባ ዝጋ' : 'አጠቃላይ ምዝገባ ክፈት'}
            </Button>
          </div>

          {/* Regular Switch */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
            regSettings.isRegularOpen !== false && regSettings.isRegistrationOpen !== false
              ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60'
              : 'bg-slate-100/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          }`}>
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-0.5">🏛️ መደበኛ (በአካል)</span>
              <span className={`text-sm font-black ${
                regSettings.isRegularOpen !== false && regSettings.isRegistrationOpen !== false
                  ? 'text-[#1657b8] dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {regSettings.isRegularOpen !== false && regSettings.isRegistrationOpen !== false ? '🟢 ክፍት ነው' : '🔴 ተዘግቷል'}
              </span>
            </div>
            <Button
              size="sm"
              variant={regSettings.isRegularOpen !== false ? 'secondary' : 'primary'}
              onClick={() => handleToggle('isRegularOpen', regSettings.isRegularOpen !== false)}
              disabled={updateSettingsMutation.isPending || regSettings.isRegistrationOpen === false}
              className="w-full"
            >
              {regSettings.isRegularOpen !== false ? 'መደበኛ ዝጋ' : 'መደበኛ ክፈት'}
            </Button>
          </div>

          {/* Distance Switch */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
            regSettings.isDistanceOpen !== false && regSettings.isRegistrationOpen !== false
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
              : 'bg-slate-100/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          }`}>
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-0.5">🌐 የርቀት ትምህርት</span>
              <span className={`text-sm font-black ${
                regSettings.isDistanceOpen !== false && regSettings.isRegistrationOpen !== false
                  ? 'text-amber-800 dark:text-amber-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {regSettings.isDistanceOpen !== false && regSettings.isRegistrationOpen !== false ? '🟢 ክፍት ነው' : '🔴 ተዘግቷል'}
              </span>
            </div>
            <Button
              size="sm"
              variant={regSettings.isDistanceOpen !== false ? 'secondary' : 'primary'}
              onClick={() => handleToggle('isDistanceOpen', regSettings.isDistanceOpen !== false)}
              disabled={updateSettingsMutation.isPending || regSettings.isRegistrationOpen === false}
              className="w-full"
            >
              {regSettings.isDistanceOpen !== false ? 'ርቀት ዝጋ' : 'ርቀት ክፈት'}
            </Button>
          </div>
        </div>

        {/* Notices & Academic Year Form */}
        <form onSubmit={handleRegSave} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                የትምህርት ዘመን
              </label>
              <Input
                value={regForm.academicYear}
                onChange={(e) => setRegForm({ ...regForm, academicYear: e.target.value })}
                placeholder="2017 ዓ.ም"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                አጠቃላይ የተዘጋበት መልእክት
              </label>
              <Input
                value={regForm.generalClosedMessage}
                onChange={(e) => setRegForm({ ...regForm, generalClosedMessage: e.target.value })}
                placeholder="የተማሪዎች ምዝገባ ለጊዜው ተዘግቷል..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                የመደበኛ ምዝገባ መዘጋት መልእክት
              </label>
              <Input
                value={regForm.regularClosedMessage}
                onChange={(e) => setRegForm({ ...regForm, regularClosedMessage: e.target.value })}
                placeholder="የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                የርቀት ምዝገባ መዘጋት መልእክት
              </label>
              <Input
                value={regForm.distanceClosedMessage}
                onChange={(e) => setRegForm({ ...regForm, distanceClosedMessage: e.target.value })}
                placeholder="የርቀት ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={updateSettingsMutation.isPending} className="gap-2">
              <Save className="w-4 h-4" />
              <span>የምዝገባ ማስታወቂያዎችን አስቀምጥ</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* 🏢 2. GENERAL SYSTEM SETTINGS */}
      <Card variant="default" padding="md" className="border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">
          አጠቃላይ የድርጅት መረጃ
        </h3>
        <form onSubmit={handleGeneralSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              የመተግበሪያ ስም
            </label>
            <Input
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="የመተግበሪያ ስም"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              የቤተክርስቲያን ይፋዊ ኢሜይል
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@teklesawiros.org"
            />
          </div>

          <div className="pt-2">
            <Button variant="outline" type="submit" loading={savingGeneral} className="gap-2">
              <Save className="w-4 h-4" />
              <span>አጠቃላይ መረጃ አስቀምጥ</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsManagement;