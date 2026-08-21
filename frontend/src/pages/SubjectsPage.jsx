import { useState, useEffect } from "react";
import axios from "axios";

function SubjectsPage({ setPage }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjects, setSubjects] = useState([]);

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
    } catch (error) {
      console.log(error);
      alert("Failed to load subjects ❌");
    }
  };

  useEffect(() => {
    fetchSubjects(selectedClass);
  }, [selectedClass]);

  const addSubject = async () => {
    if (!selectedClass) {
      alert("Please enter a class first");
      return;
    }

    if (!subjectName.trim()) {
      alert("Please enter a subject name");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/subjects",
        {
          class: selectedClass,
          subject_name: subjectName,
        },
        {
          headers: { Authorization: token },
        }
      );

      setSubjectName("");
      fetchSubjects(selectedClass);
    } catch (error) {
      console.log(error);
      alert("Failed to add subject ❌");
    }
  };

  const deleteSubject = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3000/subjects/${id}`, {
        headers: { Authorization: token },
      });

      fetchSubjects(selectedClass);
    } catch (error) {
      console.log(error);
      alert("Failed to delete subject ❌");
    }
  };

  return (
    <div className="min-h-full bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-10 max-w-3xl mx-auto border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          Manage Subjects
        </h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter Class (e.g. 10)"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Subject Name (e.g. Math)"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={addSubject}
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            Add Subject
          </button>
        </div>

        {selectedClass ? (
          <div className="space-y-3">
            {subjects.length === 0 ? (
              <p className="text-gray-500">No subjects added yet for Class {selectedClass}.</p>
            ) : (
              subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="flex justify-between items-center gap-3 border rounded-xl p-4 shadow-sm"
                >
                  <span className="font-medium">{subj.subject_name}</span>

                  <button
                    onClick={() => deleteSubject(subj.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <p className="text-gray-500">Enter a class above to view or add its subjects.</p>
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

export default SubjectsPage;