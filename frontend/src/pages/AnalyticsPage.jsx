import { useState } from "react";
import axios from "axios";

function AnalyticsPage({ setPage }) {
  const [lowAttendance, setLowAttendance] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [weakSubject, setWeakSubject] = useState([]);
  const [subjectToCheck, setSubjectToCheck] = useState("");

  const fetchLowAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:3000/analytics/low-attendance",
        { headers: { Authorization: token } }
      );
      setLowAttendance(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed loading low attendance data ❌");
    }
  };

  const fetchTopScorers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:3000/analytics/top-scorers",
        { headers: { Authorization: token } }
      );
      setTopScorers(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed loading top scorers ❌");
    }
  };

  const fetchWeakSubject = async () => {
    if (!subjectToCheck.trim()) {
      alert("Please type a subject name first (e.g. Math)");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/analytics/weak-subject?subject=${encodeURIComponent(subjectToCheck)}`,
        { headers: { Authorization: token } }
      );
      setWeakSubject(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed loading weak subject data ❌");
    }
  };

  return (
    <div className="min-h-full bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">

        <h1 className="text-2xl md:text-3xl font-bold mb-6">AI Analytics Dashboard 🤖</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <button onClick={fetchLowAttendance} className="bg-red-500 text-white px-4 py-2 rounded">
            Low Attendance
          </button>

          <button onClick={fetchTopScorers} className="bg-green-500 text-white px-4 py-2 rounded">
            Top Scorers
          </button>
        </div>

        {/* Low Attendance */}
        <h2 className="text-lg md:text-xl font-bold mt-6 mb-3">Low Attendance Students</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border min-w-[450px]">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Total Days</th>
                <th className="p-3">Present</th>
                <th className="p-3">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {lowAttendance.map((s) => (
                <tr key={s.student_id} className="text-center border-b">
                  <td className="p-3">{s.student_id}</td>
                  <td className="p-3">{s.total}</td>
                  <td className="p-3">{s.present}</td>
                  <td className="p-3">{s.percent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Scorers */}
        <h2 className="text-lg md:text-xl font-bold mt-6 mb-3">Top Scorers 🏆</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border min-w-[400px]">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Average Score</th>
              </tr>
            </thead>
            <tbody>
              {topScorers.map((s, i) => (
                <tr key={i} className="text-center border-b">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.class}</td>
                  <td className="p-3">{s.avgScore?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Weak in a chosen subject */}
        <h2 className="text-lg md:text-xl font-bold mt-6 mb-3">Weak in a Subject 📉</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Type subject name (e.g. Math)"
            value={subjectToCheck}
            onChange={(e) => setSubjectToCheck(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button onClick={fetchWeakSubject} className="bg-yellow-500 text-white px-4 py-2 rounded">
            Check Subject
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border min-w-[300px]">
            <thead className="bg-yellow-600 text-white">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Marks</th>
              </tr>
            </thead>
            <tbody>
              {weakSubject.map((s, i) => (
                <tr key={i} className="text-center border-b">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.marks_obtained}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => setPage("dashboard")}
          className="mt-6 bg-gray-500 text-white px-6 py-3 rounded-lg"
        >
          Back
        </button>

      </div>
    </div>
  );
}

export default AnalyticsPage;