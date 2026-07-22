import React from 'react';
import { Link } from 'react-router-dom';

const StudentOverview = () => {
  const cards = [
    { title: 'My Courses', icon: '📚', link: '/dashboard/courses' },
    { title: 'Resources', icon: '📖', link: '/dashboard/resources' },
    { title: 'Assignments', icon: '📝', link: '/dashboard/assignments' },
    { title: 'Exams', icon: '📊', link: '/dashboard/exams' },
    { title: 'Attendance', icon: '📅', link: '/dashboard/attendance' },
    { title: 'Profile', icon: '👤', link: '/dashboard/profile' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map(card => (
        <Link key={card.link} to={card.link}
          className="bg-white p-4 rounded-xl shadow border border-slate-100 hover:shadow-md transition flex flex-col items-center text-center space-y-2">
          <span className="text-3xl">{card.icon}</span>
          <span className="text-sm font-semibold text-slate-700">{card.title}</span>
        </Link>
      ))}
    </div>
  );
};

export default StudentOverview;