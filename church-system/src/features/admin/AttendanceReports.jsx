'use client';

import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Download,
  Filter,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  Search,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Select,
  Input,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import { useAttendanceReport } from '../../hooks/queries/useAttendance';
import { useCourses } from '../../hooks/queries/useCourses';
import { useTeachers } from '../../hooks/queries/useTeachers';

const GRADE_OPTIONS = [
  { value: 'Grade 7', label: '7ኛ ክፍል (Grade 7)' },
  { value: 'Grade 8', label: '8ኛ ክፍል (Grade 8)' },
  { value: 'Grade 9', label: '9ኛ ክፍል (Grade 9)' },
  { value: 'Grade 10', label: '10ኛ ክፍል (Grade 10)' },
  { value: 'Grade 11', label: '11ኛ ክፍል (Grade 11)' },
  { value: 'Grade 12', label: '12ኛ ክፍል (Grade 12)' },
];

const getStatusLabel = (status) => {
  switch (status) {
    case 'Present': return 'ተገኝቷል (Present)';
    case 'Late': return 'ዘግይቷል (Late)';
    case 'Absent': return 'አልተገኘም (Absent)';
    default: return status || '—';
  }
};

const getStatusVariant = (status) => {
  switch (status) {
    case 'Present': return 'approved';
    case 'Late': return 'pending';
    case 'Absent': return 'danger';
    default: return 'neutral';
  }
};

const downloadCSV = (rows, filename = 'attendance-report.csv') => {
  if (!rows.length) return;
  const headers = [
    'ተማሪ (Student)',
    'ክፍል (Grade)',
    'ኮርስ (Course)',
    'መምህር (Teacher)',
    'ቀን (Date)',
    'የመግቢያ ሰዓት (Check-in Time)',
    'ሁኔታ (Status)',
    'የትምህርት ዘመን (Academic Year)',
    'ሴሚስተር (Semester)',
  ];
  const csvRows = [headers.join(',')];
  rows.forEach((r) => {
    csvRows.push(
      [
        `"${r.studentName || ''}"`,
        `"${r.grade || ''}"`,
        `"${r.courseName || ''}"`,
        `"${r.teacherName || ''}"`,
        `"${new Date(r.date).toLocaleDateString()}"`,
        `"${r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}"`,
        `"${r.status || ''}"`,
        `"${r.academicYear || ''}"`,
        `"${r.semester || ''}"`,
      ].join(',')
    );
  });
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const AttendanceReports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    courseId: '',
    grade: '',
    status: '',
    teacher: '',
  });

  const { data: courses = [] } = useCourses();
  const { data: teachers = [] } = useTeachers();
  const { data: records = [], isLoading, isFetching, refetch } = useAttendanceReport(filters);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
        cell: ({ getValue }) => <span className="font-bold text-slate-900 dark:text-white">{getValue()}</span>,
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Grade" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || '—'}</Badge>,
      },
      {
        accessorKey: 'courseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
        cell: ({ getValue }) => <span>{getValue() || 'አጠቃላይ (General)'}</span>,
      },
      {
        accessorKey: 'teacherName',
        header: 'Teacher',
        cell: ({ getValue }) => <span className="text-slate-600 dark:text-slate-300">{getValue() || '—'}</span>,
      },
      {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ getValue }) => <span>{new Date(getValue()).toLocaleDateString()}</span>,
      },
      {
        accessorKey: 'checkInTime',
        header: 'Check-in',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {getValue() ? new Date(getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => (
          <Badge variant={getStatusVariant(getValue())} size="sm">
            {getStatusLabel(getValue())}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የመገኘት ሪፖርቶች (Attendance Reports)"
        subtitle="Filter and analyze student attendance across courses, academic grades, and date ranges."
        icon={ClipboardCheck}
        badge={<Badge variant="gold" size="sm">{records.length} Records</Badge>}
        actions={
          records.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => downloadCSV(records)} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>CSV አውርድ (Download CSV)</span>
            </Button>
          )
        }
      />

      {/* Filter Card */}
      <Card variant="default" padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <div>
            <Input
              label="የመጀመሪያ ቀን (Start Date)"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <Input
              label="የማጠቃለያ ቀን (End Date)"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <Select
              label="ኮርስ (Course)"
              name="courseId"
              value={filters.courseId}
              onChange={handleChange}
            >
              <option value="">ሁሉም ኮርሶች (All)</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Select
              label="ክፍል (Grade)"
              name="grade"
              value={filters.grade}
              onChange={handleChange}
            >
              <option value="">ሁሉም ክፍሎች (All)</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Select
              label="ሁኔታ (Status)"
              name="status"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">ሁሉም (All)</option>
              <option value="Present">ተገኝቷል (Present)</option>
              <option value="Late">ዘግይቷል (Late)</option>
              <option value="Absent">አልተገኘም (Absent)</option>
            </Select>
          </div>

          <div>
            <Select
              label="መምህር (Teacher)"
              name="teacher"
              value={filters.teacher}
              onChange={handleChange}
            >
              <option value="">ሁሉም መምህራን (All)</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName || t.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <span>{isFetching ? 'በመፈለግ ላይ...' : 'አጣራ (Filter)'}</span>
          </Button>
        </div>
      </Card>

      {/* Attendance DataTable */}
      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        emptyMessage="ምንም የመገኘት መረጃ አልተገኘም። እባክዎ ማጣሪያዎቹን አስተካክለው ይሞክሩ።"
        emptyIcon={ClipboardCheck}
      />
    </div>
  );
};

export default AttendanceReports;