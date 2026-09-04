'use client';

import React, { useState } from 'react';
import { FileText, Plus, Download, UploadCloud } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const ResourcesManagement = () => {
  const [resources, setResources] = useState([]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="የመጽሐፍትና ዲጂታል ግብአቶች (Resources)"
        subtitle="የዲጂታል መጽሐፍትን እና የትምህርት መረጃዎችን እዚህ ያስተዳድሩ"
        icon={FileText}
        badge={<Badge variant="neutral" size="sm">{resources.length} ፋይሎች</Badge>}
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>+ ግብአት ጫን (Upload)</span>
          </Button>
        }
      />

      {resources.length === 0 ? (
        <Card variant="subtle" padding="lg" className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">ምንም የተጫኑ ግብአቶች የሉም</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">የፒዲኤፍ መጽሐፍትን፣ ማስታወሻዎችን እና የመማሪያ ሰነዶችን እዚህ ማካተት ይችላሉ።</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((item, idx) => (
            <Card key={idx} variant="default" padding="md" className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--brand-primary)]" />
                <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>አውርድ</span>
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesManagement;