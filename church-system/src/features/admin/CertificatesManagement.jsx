'use client';

import React from 'react';
import { Award, Plus, Sparkles } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const CertificatesManagement = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="የምስክር ወረቀቶች (Certificates)"
        subtitle="ትምህርታቸውን ላጠናቀቁ ተማሪዎች ምስክር ወረቀት ያዘጋጁ እና ያረጋግጡ"
        icon={Award}
        badge={<Badge variant="gold" size="sm"><Sparkles className="w-3 h-3" /> 0 የተሰጡ</Badge>}
        actions={
          <Button variant="gold" size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" />
            <span>+ ምስክር ወረቀት ስጥ</span>
          </Button>
        }
      />

      <Card variant="subtle" padding="lg" className="text-center py-16">
        <Award className="w-12 h-12 mx-auto text-amber-500 opacity-60 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">ምንም የተሰጠ ምስክር ወረቀት የለም</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ትምህርታቸውን ያጠናቀቁ ተማሪዎችን መርጠው የምስክር ወረቀት መስጠት ይችላሉ።</p>
      </Card>
    </div>
  );
};

export default CertificatesManagement;