import { useState, useEffect } from "react";
import axios from "axios";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function TimetablePage({ setPage }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [periodCount, setPeriodCount] = useState(6);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [periodAssignments, setPeriodAssignments] = useState({});
  const [existingSlots, setExistingSlots] = useState([]);

  const fetchSubjects = async (className) => {
    if (!className) {
      setSubjects([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/subjects?class=${className}`,
        { headers: { Authorization: token } }
      );
      setSubjects(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/teachers", {
        headers: { Authorization: token },
      });
      setTeachers(res.data.filter((t) => t.is_approved === 1));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchExistingSlots = async (className) => {
    if (!className) {
      setExistingSlots([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/timetable?class=${className}`,
        { headers: { Authorization: token } }
      );
      setExistingSlots(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchSubjects(selectedClass);
    fetchExistingSlots(selectedClass);
  }, [selectedClass]);

  // Prefill this day's periods from whatever is already saved
  useEffect(() => {
    const dayEntries = existingSlots.filter((s) => s.day === selectedDay);
    const assignments = {};
    dayEntries.forEach((s) => {
      assignments[s.period_number] = {
        subject_name: s.subject_name,
        teacher_id: s.teacher_id || "",
      };
    });
    setPeriodAssignments(assignments);
    if (dayEntries.length > 0) {
      setPeriodCount(Math.max(6, ...dayEntries.map((s) => s.period_number)));
    }
  }, [selectedDay, existingSlots]);

  const handleAssignmentChange = (periodNumber, field, value) => {
    setPeriodAssignments({
      ...periodAssignments,
      [periodNumber]: {
        ...periodAssignments[periodNumber],
        [field]: value,
      },
    });
  };

  const handleSaveDay = async () => {
    if (!selectedClass) {
      alert("Please enter a class first");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      for (let p = 1; p <= periodCount; p++) {
        const assignment = periodAssignments[p];
        if (assignment && assignment.subject_name) {
          await axios.post(
            "http://localhost:3000/timetable",
            {
              class: selectedClass,
              day: selectedDay,
              period_number: p,
              subject_name: assignment.subject_name,
              teacher_id: assignment.teacher_id || null,
            },
            { headers: { Authorization: token } }
          );
        }
      }

      alert(`${selectedDay} schedule saved ✅`);
      fetchExistingSlots(selectedClass);
    } catch (error) {
      console.log(error);
      alert("Failed to save timetable ❌");
    }
  };

  const deleteSlot = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/timetable/${id}`, {
        headers: { Authorization: token },
      });
      fetchExistingSlots(selectedClass);
    } catch (error) {
      console.log(error);
      alert("Failed to delete ❌");
    }
  };

  // Does the currently selected day already have saved periods?
  const hasExistingDataForDay = existingSlots.some((s) => s.day === selectedDay);

  return (
    <div className="min-h-full bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-10 max-w-5xl mx-auto border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          Timetable Editor
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter Class (e.g. 10)"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && subjects.length === 0 && (
          <p className="text-gray-500 mb-4 text-sm">
            No subjects set up for Class {selectedClass} yet. Add some on the
            Subjects page first.
          </p>
        )}

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <button
            onClick={() => setPeriodCount(Math.max(1, periodCount - 1))}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow hover:scale-105 transition"
          >
            - Period
          </button>

          <div className="px-6 py-3 font-bold text-lg bg-gray-100 rounded-2xl">
            {periodCount} Periods
          </div>

          <button
            onClick={() => setPeriodCount(Math.min(10, periodCount + 1))}
            className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow hover:scale-105 transition"
          >
            + Period
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {Array.from({ length: periodCount }, (_, i) => i + 1).map((p) => (
            <div
              key={p}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border rounded-2xl p-4"
            >
              <p className="font-semibold text-gray-700">Period {p}</p>

              <select
                value={periodAssignments[p]?.subject_name || ""}
                onChange={(e) =>
                  handleAssignmentChange(p, "subject_name", e.target.value)
                }
                className="border border-gray-300 rounded-xl px-3 py-2"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.subject_name}>
                    {s.subject_name}
                  </option>
                ))}
              </select>

              <select
                value={periodAssignments[p]?.teacher_id || ""}
                onChange={(e) =>
                  handleAssignmentChange(p, "teacher_id", e.target.value)
                }
                className="border border-gray-300 rounded-xl px-3 py-2"
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={handleSaveDay}
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            Save {selectedDay} Schedule
          </button>

          <button
            onClick={() => setPage("dashboard")}
            className="bg-gray-600 text-white px-8 py-4 rounded-2xl shadow hover:bg-gray-700 transition"
          >
            Back
          </button>
        </div>

        {selectedClass && (
          <>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
              Full Timetable - Class {selectedClass}
            </h2>

            {existingSlots.length === 0 ? (
              <p className="text-gray-500">
                No periods set up yet for this class.
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
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...existingSlots]
                      .sort((a, b) => {
                        const dayDiff =
                          DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
                        if (dayDiff !== 0) return dayDiff;
                        return a.period_number - b.period_number;
                      })
                      .map((slot) => (
                      <tr key={slot.id} className="border-b text-center">
                        <td className="p-3">{slot.day}</td>
                        <td className="p-3">{slot.period_number}</td>
                        <td className="p-3">{slot.subject_name}</td>
                        <td className="p-3">{slot.teacher_name || "-"}</td>
                        <td className="p-3">
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TimetablePage;