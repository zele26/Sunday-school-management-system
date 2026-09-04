'use client';

import React, { useState } from 'react';
import { Settings, Save, Sparkles } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';

const SettingsManagement = () => {
  const [systemName, setSystemName] = useState('ተክለሳዊሮስ ሰንበት ትምህርት ቤት');
  const [email, setEmail] = useState('contact@teklesawiros.org');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('ቅንብሮቹ በተሳካ ሁኔታ ተቀምጠዋል! (Settings saved successfully)');
    }, 400);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="የሲስተም ቅንብሮች (Settings)"
        subtitle="የሰንበት ትምህርት ቤት ሥርዓት አጠቃላይ ቅንብሮችን ያስተካክሉ"
        icon={Settings}
        badge={<Badge variant="gold" size="sm">አስተዳደራዊ</Badge>}
      />

      <Card variant="default" padding="md" className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              የመተግበሪያ ስም (System Title)
            </label>
            <Input
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="System name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              የቤተክርስቲያን ይፋዊ ኢሜይል (Official Email)
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@domain.org"
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" type="submit" loading={saving} className="gap-2">
              <Save className="w-4 h-4" />
              <span>ቅንብሮችን አስቀምጥ (Save Settings)</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsManagement;