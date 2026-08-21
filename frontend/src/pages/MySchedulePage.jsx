import { useState, useEffect } from "react";
import axios from "axios";

function MySchedulePage({ setPage }) {
  const [mySlots, setMySlots] = useState([]);

  const fetchMySchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:3000/timetable/my-schedule",
        { headers: { Authorization: token } }
      );
      setMySlots(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load your schedule ❌");
    }
  };

  useEffect(() => {
    fetchMySchedule();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-4xl mx-auto border border-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          My Schedule
        </h1>

        {mySlots.length === 0 ? (
          <p className="text-gray-500">You have no periods assigned yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow-xl">
            <table className="w-full bg-white overflow-hidden">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
                <tr>
                  <th className="p-3">Day</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Subject</th>
                </tr>
              </thead>
              <tbody>
                {mySlots.map((slot) => (
                  <tr key={slot.id} className="border-b text-center">
                    <td className="p-3">{slot.day}</td>
                    <td className="p-3">{slot.period_number}</td>
                    <td className="p-3">Class {slot.class}</td>
                    <td className="p-3">{slot.subject_name}</td>
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

export default MySchedulePage;