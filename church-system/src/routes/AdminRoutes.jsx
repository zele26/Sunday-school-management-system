'use client';

// src/routes/AdminRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

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

export default function AdminRoutes() {
  const adminRoutesContent = (
    <>
      <Route index element={<AdminOverview />} />
      <Route path="distance-hub" element={<AdminDistanceHub />} />
      <Route path="people" element={<PeopleManagement />} />
      <Route path="departments" element={<DepartmentsManagement />} />
      <Route path="departments/:id/hub" element={<DepartmentHub />} />
      <Route path="department-hub" element={<DepartmentHub />} />
      <Route path="users" element={<UsersManagement />} />
      <Route path="approvals" element={<ApprovalsManagement />} />
      <Route path="add-student" element={<AddStudent />} />
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
      <Route path="students" element={<StudentsManagement />} />
      <Route path="edit-student/:id" element={<EditStudent />} />
      <Route path="qr-scanner" element={<QRScanner />} />
      <Route path="attendance-reports" element={<AttendanceReports />} />
      <Route path="registrations" element={<RegistrationsManagement />} />
      <Route path="teachers" element={<TeachersManagement />} />
      <Route path="add-teacher" element={<AddTeacher />} />
      <Route path="edit-teacher/:id" element={<EditTeacher />} />
      <Route path="password-resets" element={<PasswordResets />} />
      <Route path="resource-approval" element={<ResourceApproval />} />
      <Route path="department-memberships" element={<DepartmentMembershipsManagement />} />
      <Route path="student-profiles" element={<StudentProfilesManagement />} />
      <Route path="programs" element={<ProgramsManagement />} />
      <Route path="academic-years" element={<AcademicYearsManagement />} />
      <Route path="academic-enrollments" element={<AcademicEnrollmentsManagement />} />
      <Route path="manual-enrollment" element={<ManualEnrollment />} />
      <Route path="church-memberships" element={<ChurchMembershipsManagement />} />
      <Route path="academic-enrollments/:enrollmentId" element={<AcademicEnrollmentDetails />} />
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