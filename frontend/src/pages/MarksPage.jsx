import { useState, useEffect } from "react";
import axios from "axios";

function MarksPage({ students, setPage }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [exam, setExam] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [marksValues, setMarksValues] = useState({});

  const classList = [...new Set(students.map((stu) => stu.class))];

  const filteredStudents = selectedClass
    ? students.filter((stu) => stu.class === selectedClass)
    : [];

  // Load subjects whenever the selected class changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass) {
        setSubjects([]);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:3000/subjects?class=${selectedClass}`,
          {
            headers: { Authorization: token },
          }
        );

        setSubjects(response.data);
        setMarksValues({}); // reset marks entries when class changes
      } catch (error) {
        console.log(error);
        alert("Failed to load subjects for this class ❌");
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  const handleMarksChange = (subjectName, value) => {
    setMarksValues({
      ...marksValues,
      [subjectName]: value,
    });
  };

  const handleSaveMarks = async () => {
    if (!selectedClass) {
      alert("Please select a class first");
      return;
    }

    if (!selectedStudentId) {
      alert("Please select a student");
      return;
    }

    if (!exam.trim()) {
      alert("Please enter an exam name");
      return;
    }

    if (subjects.length === 0) {
      alert("This class has no subjects set up yet. Add subjects first.");
      return;
    }

    const marks = subjects.map((subj) => ({
      subject_name: subj.subject_name,
      marks_obtained: Number(marksValues[subj.subject_name]) || 0,
    }));

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/marks",
        {
          student_id: selectedStudentId,
          exam,
          marks,
        },
        {
          headers: { Authorization: token },
        }
      );

      alert("Marks saved ✅");
      setExam("");
      setMarksValues({});
      setSelectedStudentId("");
    } catch (error) {
      console.log(error);
      alert("Marks save failed ❌");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-100 min-h-full">
      <div className="bg-white shadow-2xl rounded-3xl p-5 md:p-10 max-w-3xl mx-auto border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          Enter Marks
        </h1>

        <div className="space-y-5">
          {/* Class Selector */}
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedStudentId("");
            }}
            className="w-full border border-gray-300 rounded-2xl px-4 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Class</option>
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>

          {/* Student Selector (filtered by class) */}
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={!selectedClass}
            className="w-full border border-gray-300 rounded-2xl px-4 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          >
            <option value="">Select Student</option>
            {filteredStudents.map((stu) => (
              <option key={stu.id} value={stu.id}>
                {stu.name} (Roll No: {stu.roll_no})
              </option>
            ))}
          </select>

          {/* Exam Name */}
          <input
            placeholder="Exam Name (e.g. Mid-Term)"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-4 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Subject marks inputs */}
          {selectedClass && subjects.length === 0 && (
            <p className="text-gray-500">
              No subjects set up for Class {selectedClass} yet. Go to the
              Subjects page to add some first.
            </p>
          )}

          {subjects.map((subj) => (
            <div
              key={subj.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
            >
              <label className="sm:w-40 shrink-0 font-medium text-gray-700">
                {subj.subject_name}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Marks out of 100"
                value={marksValues[subj.subject_name] || ""}
                onChange={(e) =>
                  handleMarksChange(subj.subject_name, e.target.value)
                }
                className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={handleSaveMarks}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            Save Marks
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

export default MarksPage;