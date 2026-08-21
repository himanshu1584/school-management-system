import { useState, useEffect } from "react";
import axios from "axios";

const STATUS_OPTIONS = ["Present", "Absent", "On Duty", "On Leave", "Teaching"];

function TeacherAttendancePage({ setPage }) {
  const [teachers, setTeachers] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [statusMap, setStatusMap] = useState({});

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3000/teachers", {
        headers: { Authorization: token },
      });

      // Only approved teachers are actual active staff
      setTeachers(response.data.filter((t) => t.is_approved === 1));
    } catch (error) {
      console.log(error);
      alert("Failed to load teachers ❌");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleStatusChange = (teacherId, status) => {
    setStatusMap({
      ...statusMap,
      [teacherId]: status,
    });
  };

  const handleSaveAll = async () => {
    if (teachers.length === 0) {
      alert("No approved teachers to mark attendance for.");
      return;
    }

    const attendance = teachers.map((t) => ({
      teacher_id: t.id,
      date: attendanceDate,
      status: statusMap[t.id] || "Present",
    }));

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/teacher-attendance",
        { attendance },
        { headers: { Authorization: token } }
      );

      alert("Teacher attendance saved successfully ✅");
    } catch (error) {
      console.log(error);
      alert("Failed to save teacher attendance ❌");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-100 min-h-full">
      <div className="bg-white shadow-2xl rounded-3xl p-5 md:p-10 border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          Mark Teacher Attendance
        </h1>

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="border p-3 rounded-lg w-full md:w-64"
          />
        </div>

        {teachers.length === 0 ? (
          <p className="text-gray-500">No approved teachers yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl shadow-xl">
            <table className="w-full bg-white overflow-hidden min-w-[500px]">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-lg">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b text-center hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{t.name}</td>
                    <td className="p-4">{t.email}</td>
                    <td className="p-4">
                      <select
                        value={statusMap[t.id] || "Present"}
                        onChange={(e) =>
                          handleStatusChange(t.id, e.target.value)
                        }
                        className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={handleSaveAll}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            Save Attendance
          </button>

          <button
            onClick={() => setPage("dashboard")}
            className="bg-gray-600 text-white px-8 py-4 rounded-2xl shadow hover:bg-gray-700 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherAttendancePage;