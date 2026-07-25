import React from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../../assets/Lidetachurch.jpg';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative bg-cover bg-center py-32" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="absolute inset-0 bg-slate-900/70"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-black">ተክለሳዊሮስ ሰንበት ትምህርት ቤት</h1>
          <p className="mt-4 text-lg text-slate-200">የሕፃናትና ወጣቶች መንፈሳዊ ትምህርት ማዕከል</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold">ይመዝገቡ</Link>
            <Link to="/login" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold">ይግቡ</Link>
          </div>
        </div>
      </section>

      {/* Vision / Mission / Values */}
      <section className="py-16 max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <h3 className="text-xl font-bold text-slate-800">ራዕያችን</h3>
          <p className="text-slate-600 mt-2">ማኅበረሰቡን በእግዚአብሔር ቃል ማነጽ።</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <h3 className="text-xl font-bold text-slate-800">ተልዕኳችን</h3>
          <p className="text-slate-600 mt-2">ለሁሉም የዕድሜ ክልል ጥራት ያለው የሰንበት ትምህርት መስጠት።</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <h3 className="text-xl font-bold text-slate-800">እሴቶቻችን</h3>
          <p className="text-slate-600 mt-2">እምነት፣ ፍቅር፣ አንድነት</p>
        </div>
      </section>
    </div>
  );
};

export default Home;