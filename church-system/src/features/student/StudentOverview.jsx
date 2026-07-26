import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const StudentOverview = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    apiFetch('/api/student/profile')
      .then(res => res.json())
      .then(setProfile)
      .catch(() => {});
  }, []);

  const regularCards = [
    { title: 'የእኔ ኮርሶች', icon: '📚', link: '/dashboard/courses' },
    { title: 'መገኘት', icon: '📅', link: '/dashboard/attendance' },
    { title: 'ማስታወቂያዎች', icon: '📢', link: '/dashboard/announcements' },
    { title: 'ውጤቶች', icon: '📊', link: '/dashboard/results' },
    { title: 'የግል መረጃ', icon: '👤', link: '/dashboard/profile' },
  ];
  const distanceCards = [
    { title: 'የመማሪያ መረጃዎች', icon: '📖', link: '/dashboard/resources' },
    { title: 'መርሃ ግብር', icon: '📅', link: '/dashboard/schedule' },
    { title: 'ማስታወቂያዎች', icon: '📢', link: '/dashboard/announcements' },
    { title: 'ውጤቶች', icon: '📊', link: '/dashboard/results' },
    { title: 'የግል መረጃ', icon: '👤', link: '/dashboard/profile' },
  ];

  const cards = profile?.studentType === 'distance' ? distanceCards : regularCards;

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