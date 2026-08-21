import { useState, useEffect } from "react";
import axios from "axios";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function TimetableViewPage({ setPage }) {
  const [allSlots, setAllSlots] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://school-management-backend-m3cf.onrender.com/timetable", {
        headers: { Authorization: token },
      });
      setAllSlots(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load timetable ❌");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const classList = [...new Set(allSlots.map((s) => s.class))];

  const filteredSlots = selectedClass
    ? allSlots
        .filter((s) => s.class === selectedClass)
        .sort((a, b) => {
          const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
          if (dayDiff !== 0) return dayDiff;
          return a.period_number - b.period_number;
        })
    : [];

  return (
    <div className="min-h-full bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-10 max-w-4xl mx-auto border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">Timetable</h1>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full border border-gray-300 rounded-2xl px-4 py-4 shadow-sm mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Class</option>
          {classList.map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </select>

        {!selectedClass ? (
          <p className="text-gray-500">Select a class to view its timetable.</p>
        ) : filteredSlots.length === 0 ? (
          <p className="text-gray-500">
            No timetable set up yet for Class {selectedClass}.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow-xl">
            <table className="w-full bg-white overflow-hidden min-w-[500px]">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
                <tr>
                  <th className="p-3">Day</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map((slot) => (
                  <tr key={slot.id} className="border-b text-center">
                    <td className="p-3">{slot.day}</td>
                    <td className="p-3">{slot.period_number}</td>
                    <td className="p-3">{slot.subject_name}</td>
                    <td className="p-3">{slot.teacher_name || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => setPage("dashboard")}
          className="mt-8 bg-gray-600 text-white px-8 py-4 rounded-2xl shadow hover:bg-gray-700 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default TimetableViewPage;