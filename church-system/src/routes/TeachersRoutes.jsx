import React from 'react';
import { Routes, Route } from 'react-router-dom';

import TeacherOverview from '../features/teacher/TeacherOverview';
import TeacherClasses from '../features/teacher/TeacherClasses';
import TeacherCourses from '../features/teacher/TeacherCourses';
import TeacherContent from '../features/teacher/TeacherContent';
import TeacherGrading from '../features/teacher/TeacherGrading';
import TeacherCommunication from '../features/teacher/TeacherCommunication';
import TeacherReports from '../features/teacher/TeacherReports';

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route index element={<TeacherOverview />} />
      <Route path="classes" element={<TeacherClasses />} />
      <Route path="courses" element={<TeacherCourses />} />
      <Route path="content" element={<TeacherContent />} />
      <Route path="grading" element={<TeacherGrading />} />
      <Route path="communication" element={<TeacherCommunication />} />
      <Route path="reports" element={<TeacherReports />} />
    </Routes>
  );
}