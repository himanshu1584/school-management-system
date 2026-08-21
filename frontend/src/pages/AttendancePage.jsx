import { useState } from "react";

function AttendancePage({ students, setPage, saveAttendance }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const classList = [...new Set(students.map((stu) => stu.class))];

  const filteredStudents = selectedClass
    ? students.filter((stu) => stu.class === selectedClass)
    : [];

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status,
    });
  };

  const handleSaveAll = async () => {
    for (const stu of filteredStudents) {
      const status = attendanceData[stu.id] || "Present";
      await saveAttendance(stu.id, stu.class, status, attendanceDate);
    }

    alert("Attendance saved successfully ✅");
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-100 min-h-full">
      <div className="bg-white shadow-2xl rounded-3xl p-5 md:p-10 border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          Mark Attendance
        </h1>

        {/* Date Picker */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">
            Attendance Date
          </label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="border p-3 rounded-lg w-full md:w-64"
          />
        </div>

        {/* Class Selector */}
        <div className="mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border p-3 rounded-lg w-full md:w-64"
          >
            <option value="">Select Class</option>

            {classList.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-3xl shadow-xl">
          <table className="w-full bg-white overflow-hidden min-w-[500px]">
            <thead className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-lg">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Class</th>
                <th className="p-4">Roll No</th>
                <th className="p-4">Attendance</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((stu) => (
                <tr
                  key={stu.id}
                  className="border-b text-center hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">{stu.name}</td>
                  <td className="p-4 font-medium">{stu.class}</td>
                  <td className="p-4 font-medium">{stu.roll_no}</td>

                  <td className="p-4">
                    <select
                      onChange={(e) =>
                        handleAttendanceChange(stu.id, e.target.value)
                      }
                      className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      defaultValue="Present"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
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

export default AttendancePage;