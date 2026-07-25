import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <header className="bg-slate-900 text-white py-4 px-6 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">ተክለሳዊሮስ</Link>
        <nav className="space-x-4 text-sm">
          <Link to="/about" className="hover:underline">ስለኛ</Link>
          <Link to="/classes" className="hover:underline">ክፍሎች</Link>
          <Link to="/announcements" className="hover:underline">ማስታወቂያዎች</Link>
          <Link to="/contact" className="hover:underline">ያግኙን</Link>
          <Link to="/login" className="bg-blue-600 px-3 py-1 rounded-lg">ይግቡ</Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 text-center py-4 text-sm">
        © {new Date().getFullYear()} ተክለሳዊሮስ ሰንበት ትምህርት ቤት
      </footer>
    </div>
  );
};

export default PublicLayout;