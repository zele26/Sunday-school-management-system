'use client';

// src/routes/StudentRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import StudentOverview from '../features/student/StudentOverview';
import StudentCourses from '../features/student/StudentCourses';
import StudentAttendance from '../features/student/StudentAttendance';
import StudentAnnouncements from '../features/student/StudentAnnouncements';
import StudentProfileModule from '../features/student/StudentProfileModule';
import StudentResources from '../features/student/StudentResources';
import StudentExams from '../features/student/StudentExams';
import StudentTakeExam from '../features/student/StudentTakeExam';
import StudentResults from '../features/student/StudentResults';
import StudentResultDetail from '../features/student/StudentResultDetail';
import DistanceClassroom from '../features/student/DistanceClassroom';

export default function StudentRoutes() {
  const studentRoutesContent = (
    <>
      <Route index element={<StudentOverview />} />
      <Route path="courses" element={<StudentCourses />} />
      <Route path="distance-classroom/:courseId" element={<DistanceClassroom />} />
      <Route path="attendance" element={<StudentAttendance />} />
      <Route path="announcements" element={<StudentAnnouncements />} />
      <Route path="profile" element={<StudentProfileModule />} />
      <Route path="resources" element={<StudentResources />} />
      <Route path="assignments" element={<StudentCourses />} />
      <Route path="exams" element={<StudentExams />} />
      <Route path="exams/:quizId" element={<StudentTakeExam />} />
      <Route path="results" element={<StudentResults />} />
      <Route path="results/:resultId" element={<StudentResultDetail />} />
    </>
  );

  return (
    <Routes>
      <Route path="/dashboard">
        {studentRoutesContent}
      </Route>
      <Route path="/student">
        {studentRoutesContent}
      </Route>
      {studentRoutesContent}
    </Routes>
  );
}