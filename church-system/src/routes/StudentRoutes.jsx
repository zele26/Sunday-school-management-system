import React from 'react';
import { Routes, Route } from 'react-router-dom';

import StudentOverview from '../features/student/StudentOverview';
import StudentCourses from '../features/student/StudentCourses';
import StudentAttendance from '../features/student/StudentAttendance';
import StudentAnnouncements from '../features/student/StudentAnnouncements';
import StudentProfileModule from '../features/student/StudentProfileModule';

export default function StudentRoutes() {
  return (
    <Routes>
      <Route index element={<StudentOverview />} />
      <Route path="courses" element={<StudentCourses />} />
      <Route path="attendance" element={<StudentAttendance />} />
      <Route path="announcements" element={<StudentAnnouncements />} />
      <Route path="profile" element={<StudentProfileModule />} />
    </Routes>
  );
}