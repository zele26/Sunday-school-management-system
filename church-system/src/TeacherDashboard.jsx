import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedWereda, setSelectedWereda] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

  useEffect(() => {
    const fetchTeacherData = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('https://church-api-3l2c.onrender.com/api/auth/profile', {

    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/students`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName || student.fullName} ${student.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === "All" || student.grade === selectedGrade;
    const matchesCity = selectedCity === "All" || student.city === selectedCity;
    const matchesWereda = selectedWereda === "All" || student.wereda === selectedWereda;
    return matchesSearch && matchesGrade && matchesCity && matchesWereda;
  }).sort((a, b) => {
    if (sortBy === "name") {
      const nameA = `${a.firstName || a.fullName} ${a.lastName || ''}`.toLowerCase();
      const nameB = `${b.firstName || b.fullName} ${b.lastName || ''}`.toLowerCase();
      return nameA.localeCompare(nameB);
    } else if (sortBy === "grade") {
      return (a.grade || "").localeCompare(b.grade || "");
    } else if (sortBy === "city") {
      return (a.city || "").localeCompare(b.city || "");
    }
    return 0;
  });

  const uniqueGrades = [...new Set(students.map(student => student.grade).filter(Boolean))].sort();
  const uniqueCities = [...new Set(students.map(student => student.city).filter(Boolean))].sort();
  const uniqueWeredas = [...new Set(students.map(student => student.wereda).filter(Boolean))].sort();

    fetchTeacherData();
    fetchStudentsAuthorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTeacher(data);
      setLoading(false);
    };
    fetchTeacherData();
  }, []);gradient-to-r from-blue-900 to-blue-800 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="font-bold text-lg italic">ተክለሳዊሮስ መምህራን መድረክ</h1>
        <button onClick={() => { onLogout(); navigate('/'); }} className="bg-red-500 px-4 py-1 rounded-lg text-sm hover:bg-red-600 transition">ውጣ (Logout)</button>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8 flex items-center gap-6 hover:shadow-xl transition-shadow">
          <div className="text-5xl">👨‍🏫</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">እንኳን ደህና መጡ፣ መምህር {teacher?.fullName.split(' ')[0]}!</h2>
            <p className="text-gray-500">ዛሬ የእርስዎን ክፍል ያስተዳድሩ</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white p-2 rounded-2xl shadow-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            አጠቃላይ እይታ (Overview)
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ተማሪዎች (Students)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attendance Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-green-500 hover:scale-105 transition-transform cursor-pointer hover:shadow-xl">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">የተማሪዎች መገኘት (Attendance)</h3>
              <p className="text-gray-500 text-sm">የዛሬውን የክፍል መገኘት እዚህ ይሙሉ</p>
            </div>

            {/* Student List Card */}
            <div
              className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-blue-500 hover:scale-105 transition-transform cursor-pointer hover:shadow-xl"
              onClick={() => setActiveTab('students')}
            >
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">የእኔ ተማሪዎች</h3>
              <p className="text-gray-500 text-sm">የክፍልዎን ተማሪዎች ዝርዝር እና መረጃ ይመልከቱ</p>
            </div>

            {/* Lessons Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-orange-500 hover:scale-105 transition-transform cursor-pointer hover:shadow-xl">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">ትምህርቶች (Lessons)</h3>
              <p className="text-gray-500 text-sm">የሳምንቱን የትምህርት ዝግጅት ይስቀሉ</p>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">አጠቃላይ ተማሪዎች</p>
                    <p className="text-3xl font-bold text-gray-800">{students.length}</p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ተመረጡ ተማሪዎች</p>
                    <p className="text-3xl font-bold text-gray-800">{filteredStudents.length}</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ክፍሎች ብዛት</p>
                    <p className="text-3xl font-bold text-gray-800">{uniqueGrades.length}</p>
                  </div>
                  <div className="text-3xl">📚</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ከተሞች ብዛት</p>
                    <p className="text-3xl font-bold text-gray-800">{uniqueCities.length}</p>
                  </div>
                  <div className="text-3xl">🏙️</div>
                </div>
              </div>
            </div>
            {/* Search and Filter Controls */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {/* Search Input */}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="ተማሪ ስም ያስገቡ... (Search student name...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="name">በስም አስቀምጥ (Sort by Name)</option>
                    <option value="grade">በክፍል አስቀምጥ (Sort by Grade)</option>
                    <option value="city">በከተማ አስቀምጥ (Sort by City)</option>
                  </select>
                </div>

                {/* Grade Filter */}
                <div>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="All">ሁሉም ክፍሎች (All Grades)</option>
                    {uniqueGrades.map(grade => (
                      <option key={grade} value={grade}>ክፍል {grade}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="All">ሁሉም ከተሞች (All Cities)</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second Row for Wereda Filter */}
              <div className="flex justify-between items-center">
                <div className="w-48">
                  <select
                    value={selectedWereda}
                    onChange={(e) => setSelectedWereda(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="All">ሁሉም ወረዳዎች (All Weredas)</option>
                    {uniqueWeredas.map(wereda => (
                      <option key={wereda} value={wereda}>{wereda}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedGrade("All");
                    setSelectedCity("All"); flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  ተማሪዎች ዝርዝር ({filteredStudents.length})
                </h2>
                <div className="text-sm text-gray-500">
                  ከ {students.length} ተማሪዎች አንጻር
                </div
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  ሁሉንም አፅዳ (Clear All Filters)
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  ተማሪዎች ዝርዝር ({filteredStudents.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    ተማሪ አልተገኘም (No students found)
                  </div>
                ) : (
                  filteredStudents.map((student, index) => (
                    <div key={student._id || index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {(student.firstName || student.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">
                              {student.firstName || student.fullName} {student.lastName || ''}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📧 {student.email}</span>
                              <span>📱 {student.phoneNumber || 'N/A'}</span>
                              {student.grade && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">ክፍል {student.grade}</span>}
                              {student.emergencyPersonName && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">🚨 አደጋ</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {student.city && <div>🏠 {student.city}</div>}
                            {student.wereda && <div>📍 {student.wereda}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}Lessons Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-orange-500 hover:scale-105 transition-transform cursor-pointer hover:shadow-xl">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">ትምህርቶች (Lessons)</h3>
            <p className="text-gray-500 text-sm">የሳምንቱን የትምህርት ዝግጅት ይስቀሉ</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;