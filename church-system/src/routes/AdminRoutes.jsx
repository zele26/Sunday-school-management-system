import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AdminOverview from '../features/admin/AdminOverview';
import UsersManagement from '../features/admin/UsersManagement';
import ApprovalsManagement from '../features/admin/ApprovalsManagement';
import ClassesManagement from '../features/admin/ClassesManagement';
import CoursesManagement from '../features/admin/CoursesManagement';
import AnnouncementsManagement from '../features/admin/AnnouncementsManagement';
import ResourcesManagement from '../features/admin/ResourcesManagement';
import AttendanceManagement from '../features/admin/AttendanceManagement';
import ReportsManagement from '../features/admin/ReportsManagement';
import ComplaintsManagement from '../features/admin/ComplaintsManagement';
import CertificatesManagement from '../features/admin/CertificatesManagement';
import SettingsManagement from '../features/admin/SettingsManagement';
import AuditLogsManagement from '../features/admin/AuditLogsManagement';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminOverview />} />
      <Route path="users" element={<UsersManagement />} />
      <Route path="approvals" element={<ApprovalsManagement />} />
      <Route path="classes" element={<ClassesManagement />} />
      <Route path="courses" element={<CoursesManagement />} />
      <Route path="announcements" element={<AnnouncementsManagement />} />
      <Route path="resources" element={<ResourcesManagement />} />
      <Route path="attendance" element={<AttendanceManagement />} />
      <Route path="reports" element={<ReportsManagement />} />
      <Route path="complaints" element={<ComplaintsManagement />} />
      <Route path="certificates" element={<CertificatesManagement />} />
      <Route path="settings" element={<SettingsManagement />} />
      <Route path="audit-logs" element={<AuditLogsManagement />} />
    </Routes>
  );
}