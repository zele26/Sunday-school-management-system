'use client';

// src/routes/AdminRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { hasOverviewAccess, getFirstPermittedAdminRoute, hasPermission, PERMISSIONS } from '../utils/permissions';

import AdminOverview from '../features/admin/AdminOverview';
import UsersManagement from '../features/admin/UsersManagement';
import ApprovalsManagement from '../features/admin/ApprovalsManagement';
import AddStudent from '../features/admin/AddStudent';
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
import StudentsManagement from '../features/admin/StudentsManagement';
import QRScanner from '../features/admin/QRScanner';
import AttendanceReports from '../features/admin/AttendanceReports';
import RegistrationsManagement from '../features/admin/RegistrationsManagement';
import AddTeacher from '../features/admin/AddTeacher';
import PasswordResets from '../features/admin/PasswordResets';
import TeachersManagement from '../features/admin/TeachersManagement';
import EditTeacher from '../features/admin/EditTeacher';
import EditStudent from '../features/admin/EditStudent';
import ResourceApproval from '../features/admin/ResourceApproval';
import PeopleManagement from '../features/admin/PeopleManagement';
import DepartmentsManagement from '../features/admin/DepartmentsManagement';
import DepartmentMembershipsManagement from '../features/admin/DepartmentMembershipsManagement';
import StudentProfilesManagement from '../features/admin/StudentProfilesManagement';
import ProgramsManagement from '../features/admin/ProgramsManagement';
import AcademicYearsManagement from '../features/admin/AcademicYearsManagement';
import AcademicEnrollmentsManagement from '../features/admin/AcademicEnrollmentsManagement';
import ManualEnrollment from '../features/admin/ManualEnrollment';
import ChurchMembershipsManagement from '../features/admin/ChurchMembershipsManagement';
import AcademicEnrollmentDetails from '../features/admin/AcademicEnrollmentDetails';
import DepartmentHub from '../features/admin/DepartmentHub';
import AdminDistanceHub from '../features/admin/AdminDistanceHub';
import AdminAnalyticsDashboard from '../features/admin/AdminAnalyticsDashboard';

function AdminIndexRoute() {
  const user = useAuthStore((state) => state.user);
  if (hasOverviewAccess(user)) {
    return <AdminOverview />;
  }
  const targetRoute = getFirstPermittedAdminRoute(user);
  return <Navigate to={targetRoute} replace />;
}

function AdminPermissionGuard({ permission, children }) {
  const user = useAuthStore((state) => state.user);
  if (!permission || hasPermission(user, permission)) {
    return children;
  }
  const fallback = getFirstPermittedAdminRoute(user);
  return <Navigate to={fallback} replace />;
}

export default function AdminRoutes() {
  const adminRoutesContent = (
    <>
      <Route index element={<AdminIndexRoute />} />
      <Route path="distance-hub" element={<AdminPermissionGuard permission={PERMISSIONS.ACADEMIC_DISTANCE_HUB}><AdminDistanceHub /></AdminPermissionGuard>} />
      <Route path="people" element={<AdminPermissionGuard permission={PERMISSIONS.STUDENTS_VIEW}><PeopleManagement /></AdminPermissionGuard>} />
      <Route path="departments" element={<AdminPermissionGuard permission={PERMISSIONS.DEPARTMENTS_MANAGE}><DepartmentsManagement /></AdminPermissionGuard>} />
      <Route path="departments/:id/hub" element={<AdminPermissionGuard permission={PERMISSIONS.DEPARTMENTS_MANAGE}><DepartmentHub /></AdminPermissionGuard>} />
      <Route path="department-hub" element={<AdminPermissionGuard permission={PERMISSIONS.DEPARTMENTS_MANAGE}><DepartmentHub /></AdminPermissionGuard>} />
      <Route path="users" element={<AdminPermissionGuard permission={PERMISSIONS.USERS_MANAGE}><UsersManagement /></AdminPermissionGuard>} />
      <Route path="approvals" element={<AdminPermissionGuard permission={PERMISSIONS.USERS_MANAGE}><ApprovalsManagement /></AdminPermissionGuard>} />
      <Route path="add-student" element={<AdminPermissionGuard permission={PERMISSIONS.STUDENTS_MANAGE}><AddStudent /></AdminPermissionGuard>} />
      <Route path="classes" element={<AdminPermissionGuard permission={PERMISSIONS.ACADEMIC_CLASSES}><ClassesManagement /></AdminPermissionGuard>} />
      <Route path="courses" element={<AdminPermissionGuard permission={PERMISSIONS.ACADEMIC_COURSES}><CoursesManagement /></AdminPermissionGuard>} />
      <Route path="announcements" element={<AdminPermissionGuard permission={PERMISSIONS.ANNOUNCEMENTS_MANAGE}><AnnouncementsManagement /></AdminPermissionGuard>} />
      <Route path="resources" element={<AdminPermissionGuard permission={PERMISSIONS.RESOURCES_MANAGE}><ResourcesManagement /></AdminPermissionGuard>} />
      <Route path="attendance" element={<AdminPermissionGuard permission={[PERMISSIONS.ATTENDANCE_VIEW, PERMISSIONS.ATTENDANCE_MANAGE]}><AttendanceManagement /></AdminPermissionGuard>} />
      <Route path="reports" element={<AdminPermissionGuard permission={PERMISSIONS.REPORTS_VIEW}><ReportsManagement /></AdminPermissionGuard>} />
      <Route path="complaints" element={<AdminPermissionGuard permission={PERMISSIONS.USERS_MANAGE}><ComplaintsManagement /></AdminPermissionGuard>} />
      <Route path="certificates" element={<AdminPermissionGuard permission={[PERMISSIONS.CERTIFICATES_VIEW, PERMISSIONS.CERTIFICATES_ISSUE]}><CertificatesManagement /></AdminPermissionGuard>} />
      <Route path="settings" element={<AdminPermissionGuard permission={PERMISSIONS.SETTINGS_MANAGE}><SettingsManagement /></AdminPermissionGuard>} />
      <Route path="audit-logs" element={<AdminPermissionGuard permission={PERMISSIONS.AUDIT_LOGS_VIEW}><AuditLogsManagement /></AdminPermissionGuard>} />
      <Route path="students" element={<AdminPermissionGuard permission={PERMISSIONS.STUDENTS_VIEW}><StudentsManagement /></AdminPermissionGuard>} />
      <Route path="edit-student/:id" element={<AdminPermissionGuard permission={PERMISSIONS.STUDENTS_MANAGE}><EditStudent /></AdminPermissionGuard>} />
      <Route path="qr-scanner" element={<AdminPermissionGuard permission={PERMISSIONS.ATTENDANCE_SCAN}><QRScanner /></AdminPermissionGuard>} />
      <Route path="attendance-reports" element={<AdminPermissionGuard permission={[PERMISSIONS.ATTENDANCE_VIEW, PERMISSIONS.ATTENDANCE_MANAGE]}><AttendanceReports /></AdminPermissionGuard>} />
      <Route path="analytics" element={<AdminPermissionGuard permission={PERMISSIONS.ANALYTICS_VIEW}><AdminAnalyticsDashboard /></AdminPermissionGuard>} />
      <Route path="registrations" element={<AdminPermissionGuard permission={[PERMISSIONS.REGISTRATIONS_VIEW, PERMISSIONS.REGISTRATIONS_APPROVE]}><RegistrationsManagement /></AdminPermissionGuard>} />
      <Route path="teachers" element={<AdminPermissionGuard permission={PERMISSIONS.TEACHERS_VIEW}><TeachersManagement /></AdminPermissionGuard>} />
      <Route path="add-teacher" element={<AdminPermissionGuard permission={PERMISSIONS.TEACHERS_MANAGE}><AddTeacher /></AdminPermissionGuard>} />
      <Route path="edit-teacher/:id" element={<AdminPermissionGuard permission={PERMISSIONS.TEACHERS_MANAGE}><EditTeacher /></AdminPermissionGuard>} />
      <Route path="password-resets" element={<AdminPermissionGuard permission={PERMISSIONS.PASSWORD_RESETS_MANAGE}><PasswordResets /></AdminPermissionGuard>} />
      <Route path="resource-approval" element={<AdminPermissionGuard permission={PERMISSIONS.RESOURCES_MANAGE}><ResourceApproval /></AdminPermissionGuard>} />
      <Route path="department-memberships" element={<AdminPermissionGuard permission={PERMISSIONS.MEMBERSHIPS_MANAGE}><DepartmentMembershipsManagement /></AdminPermissionGuard>} />
      <Route path="student-profiles" element={<AdminPermissionGuard permission={PERMISSIONS.STUDENTS_VIEW}><StudentProfilesManagement /></AdminPermissionGuard>} />
      <Route path="programs" element={<AdminPermissionGuard permission={PERMISSIONS.ACADEMIC_CLASSES}><ProgramsManagement /></AdminPermissionGuard>} />
      <Route path="academic-years" element={<AdminPermissionGuard permission={PERMISSIONS.ACADEMIC_CLASSES}><AcademicYearsManagement /></AdminPermissionGuard>} />
      <Route path="academic-enrollments" element={<AdminPermissionGuard permission={PERMISSIONS.ACADEMIC_ENROLLMENTS}><AcademicEnrollmentsManagement /></AdminPermissionGuard>} />
      <Route path="manual-enrollment" element={<AdminPermissionGuard permission={PERMISSIONS.ACADEMIC_ENROLLMENTS}><ManualEnrollment /></AdminPermissionGuard>} />
      <Route path="church-memberships" element={<AdminPermissionGuard permission={PERMISSIONS.MEMBERSHIPS_MANAGE}><ChurchMembershipsManagement /></AdminPermissionGuard>} />
      <Route path="academic-enrollments/:enrollmentId" element={<AdminPermissionGuard permission={PERMISSIONS.ACADEMIC_ENROLLMENTS}><AcademicEnrollmentDetails /></AdminPermissionGuard>} />
    </>
  );

  return (
    <Routes>
      <Route path="/admin">
        {adminRoutesContent}
      </Route>
      {adminRoutesContent}
    </Routes>
  );
}