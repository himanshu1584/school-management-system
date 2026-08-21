import { useState, useEffect } from "react";
import axios from "axios";

function TeacherDiaryPage({ students, setPage }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [diaryDate, setDiaryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [topic, setTopic] = useState("");
  const [entries, setEntries] = useState([]);

  const classList = [...new Set(students.map((stu) => stu.class))];

  const fetchSubjects = async (className) => {
    if (!className) {
      setSubjects([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:3000/subjects?class=${className}`,
        {
          headers: { Authorization: token },
        }
      );

      setSubjects(response.data);
      setSelectedSubject("");
    } catch (error) {
      console.log(error);
      alert("Failed to load subjects for this class ❌");
    }
  };

  const fetchMyEntries = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3000/teacher-diary", {
        headers: { Authorization: token },
      });

      setEntries(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load your diary history ❌");
    }
  };

  useEffect(() => {
    fetchMyEntries();
  }, []);

  useEffect(() => {
    fetchSubjects(selectedClass);
  }, [selectedClass]);

  const handleSaveEntry = async () => {
    if (!selectedClass) {
      alert("Please select a class first");
      return;
    }

    if (!selectedSubject) {
      alert("Please select a subject");
      return;
    }

    if (!topic.trim()) {
      alert("Please describe what you taught");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/teacher-diary",
        {
          class: selectedClass,
          subject_name: selectedSubject,
          date: diaryDate,
          topic,
        },
        {
          headers: { Authorization: token },
        }
      );

      alert("Diary entry saved 📔");
      setTopic("");
      fetchMyEntries();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Failed to save entry ❌");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-100 min-h-full">
      <div className="bg-white shadow-2xl rounded-3xl p-5 md:p-10 max-w-4xl mx-auto border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          Teacher Diary
        </h1>

        <div className="space-y-5 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-4 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Class</option>
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedClass}
            className="w-full border border-gray-300 rounded-2xl px-4 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          >
            <option value="">Select Subject</option>
            {subjects.map((subj) => (
              <option key={subj.id} value={subj.subject_name}>
                {subj.subject_name}
              </option>
            ))}
          </select>

          {selectedClass && subjects.length === 0 && (
            <p className="text-gray-500 text-sm">
              No subjects set up for Class {selectedClass} yet. Add some on the Subjects page first.
            </p>
          )}

          <input
            type="date"
            value={diaryDate}
            onChange={(e) => setDiaryDate(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-4 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <textarea
            placeholder="What did you teach today?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows="4"
            className="w-full border border-gray-300 rounded-2xl px-4 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={handleSaveEntry}
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            Save Entry
          </button>

          <button
            onClick={() => setPage("dashboard")}
            className="bg-gray-600 text-white px-8 py-4 rounded-2xl shadow hover:bg-gray-700 transition"
          >
            Back
          </button>
        </div>

        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
          Your Recent Entries
        </h2>

        {entries.length === 0 ? (
          <p className="text-gray-500">No diary entries yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow-xl">
            <table className="w-full bg-white overflow-hidden min-w-[600px]">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Topic Taught</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b text-center">
                    <td className="p-3">{entry.date}</td>
                    <td className="p-3">{entry.class}</td>
                    <td className="p-3">{entry.subject_name}</td>
                    <td className="p-3 text-left">{entry.topic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDiaryPage;