import { apiFetch, API_BASE_URL } from '../../api/apiClient';

const TeacherLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', courseId: '', order: 0 });

  useEffect(() => {
    fetchMyCourses();
    fetchLessons();
  }, []);

  const fetchMyCourses = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/teacher/my-courses`, { headers: { Authorization: `Bearer ${token}` } });
    setCourses(await res.json());
  };

  const fetchLessons = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/teacher/lessons`, { headers: { Authorization: `Bearer ${token}` } });
    setLessons(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/teacher/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: '', content: '', courseId: '', order: 0 });
      fetchLessons();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">My Lessons</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input name="title" placeholder="Lesson Title" required value={form.title}
          onChange={(e) => setForm({...form, title: e.target.value})}
          className="w-full p-2 border rounded-xl" />
        <textarea name="content" placeholder="Content" value={form.content}
          onChange={(e) => setForm({...form, content: e.target.value})}
          className="w-full p-2 border rounded-xl" />
        <select name="courseId" required value={form.courseId}
          onChange={(e) => setForm({...form, courseId: e.target.value})}
          className="w-full p-2 border rounded-xl">
          <option value="">Select Course</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input type="number" name="order" placeholder="Order" value={form.order}
          onChange={(e) => setForm({...form, order: e.target.value})}
          className="w-full p-2 border rounded-xl" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl">Upload Lesson</button>
      </form>

      <h3 className="font-semibold mb-2">Existing Lessons</h3>
      <ul className="text-sm divide-y">
        {lessons.map(l => (
          <li key={l._id} className="py-2">
            <strong>{l.title}</strong> ({l.course?.name}) – Order: {l.order}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherLessons;