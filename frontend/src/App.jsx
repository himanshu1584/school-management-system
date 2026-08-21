import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentPage from "./pages/StudentPage";
import AttendancePage from "./pages/AttendancePage";
import MarksPage from "./pages/MarksPage";
import AddStudentPage from "./pages/AddStudentPage";
import TimetablePage from "./pages/TimetablePage";
import TimetableViewPage from "./pages/TimetableViewPage";
import MySchedulePage from "./pages/MySchedulePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SubjectsPage from "./pages/SubjectsPage";
import ManageTeachersPage from "./pages/ManageTeachersPage";
import TeacherAttendancePage from "./pages/TeacherAttendancePage";
import AdminProfilePage from "./pages/AdminProfilePage";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import TeacherDiaryPage from "./pages/TeacherDiaryPage";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

import {
  FaUserGraduate,
  FaCheckCircle,
  FaTimesCircle,
  FaBullhorn,
} from "react-icons/fa";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [authView, setAuthView] = useState("login"); // "login" | "register"
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [students, setStudents] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);

  const [attendanceReport, setAttendanceReport] = useState([]);
  const [teacherAttendanceReport, setTeacherAttendanceReport] = useState([]);
  const [reportDateFilter, setReportDateFilter] = useState("");
  const [marksReport, setMarksReport] = useState([]);
  const [marksClassFilter, setMarksClassFilter] = useState("");
  const [marksExamFilter, setMarksExamFilter] = useState("");
  const [marksNameFilter, setMarksNameFilter] = useState("");
  const [reportCard, setReportCard] = useState(null);

  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeAttachment, setNoticeAttachment] = useState(null);
  const [noticeFileResetKey, setNoticeFileResetKey] = useState(0);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [student, setStudent] = useState({
    name: "",
    class: "",
    roll_no: "",
    father_name: "",
    mother_name: "",
    apaar_id: "",
    pen_number: "",
    ifsc: "",
    account_number: "",
    srn_number: "",
    photo_path: "",
    aadhaar_path: "",
    birth_certificate_path: "",
  });

  const [studentFiles, setStudentFiles] = useState({
    photo: null,
    aadhaar: null,
    birth_certificate: null,
  });

  const [fileInputResetKey, setFileInputResetKey] = useState(0);

  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    reports: 0,
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        { email, password }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      setUserRole(response.data.role);
      setSchoolName(response.data.school_name || "");
      setLoggedIn(true);
      alert("Login successful 🚀");
    } catch (error) {
      console.log(error);
      alert("Login failed ❌");
    }
  };

  const handleStudentChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setStudentFiles({
      ...studentFiles,
      [e.target.name]: e.target.files[0] || null,
    });
  };

  const fetchStudents = async (targetPage = null) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:3000/students",
        {
          headers: { Authorization: token },
        }
      );

      setStudents(response.data);

      if (targetPage) {
        setPage(targetPage);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to fetch students ❌");
    }
  };

  const handleSaveStudent = async () => {
    // Basic validation - name is required so we never save a blank record
    if (!student.name || !student.name.trim()) {
      alert("Please enter the student's name before saving.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", student.name);
      formData.append("class", student.class);
      formData.append("roll_no", student.roll_no);
      formData.append("father_name", student.father_name);
      formData.append("mother_name", student.mother_name);
      formData.append("apaar_id", student.apaar_id);
      formData.append("pen_number", student.pen_number);
      formData.append("ifsc", student.ifsc);
      formData.append("account_number", student.account_number);
      formData.append("srn_number", student.srn_number);

      if (studentFiles.photo) formData.append("photo", studentFiles.photo);
      if (studentFiles.aadhaar) formData.append("aadhaar", studentFiles.aadhaar);
      if (studentFiles.birth_certificate)
        formData.append("birth_certificate", studentFiles.birth_certificate);

      if (editingStudentId) {
        await axios.put(
          `http://localhost:3000/students/${editingStudentId}`,
          formData,
          {
            headers: { Authorization: token },
          }
        );

        alert("Student updated ✏️");
        setEditingStudentId(null);
      } else {
        await axios.post(
          "http://localhost:3000/students",
          formData,
          {
            headers: { Authorization: token },
          }
        );

        alert("Student saved 🚀");
      }

      setStudent({
        name: "",
        class: "",
        roll_no: "",
        father_name: "",
        mother_name: "",
        apaar_id: "",
        pen_number: "",
        ifsc: "",
        account_number: "",
        srn_number: "",
        photo_path: "",
        aadhaar_path: "",
        birth_certificate_path: "",
      });
      setStudentFiles({ photo: null, aadhaar: null, birth_certificate: null });
      setFileInputResetKey((prev) => prev + 1);

      await fetchStudents();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Save failed ❌");
    }
  };

  const deleteStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3000/students/${id}`,
        {
          headers: { Authorization: token },
        }
      );

      setStudents(students.filter((stu) => stu.id !== id));
    } catch (error) {
      console.log(error);
      alert("Delete failed ❌");
    }
  };

  const editStudent = (stu) => {
    setStudent({
      name: stu.name || "",
      class: stu.class || "",
      roll_no: stu.roll_no || "",
      father_name: stu.father_name || "",
      mother_name: stu.mother_name || "",
      apaar_id: stu.apaar_id || "",
      pen_number: stu.pen_number || "",
      ifsc: stu.ifsc || "",
      account_number: stu.account_number || "",
      srn_number: stu.srn_number || "",
      photo_path: stu.photo_path || "",
      aadhaar_path: stu.aadhaar_path || "",
      birth_certificate_path: stu.birth_certificate_path || "",
    });

    setStudentFiles({ photo: null, aadhaar: null, birth_certificate: null });
    setFileInputResetKey((prev) => prev + 1);
    setEditingStudentId(stu.id);
    setPage("addStudent");
  };

  const saveAttendance = async (studentId, studentClass, status, date) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/attendance",
        {
          attendance: [
            {
              student_id: studentId,
              class: studentClass,
              date: date,
              status,
            },
          ],
        },
        {
          headers: { Authorization: token },
        }
      );

      await fetchAttendanceReport();
    } catch (error) {
      console.log(error);
      alert("Attendance save failed ❌");
    }
  };

  const fetchAttendanceReport = async (dateFilter = "") => {
    try {
      const token = localStorage.getItem("token");

      const url = dateFilter
        ? `http://localhost:3000/attendance?date=${dateFilter}`
        : "http://localhost:3000/attendance";

      const response = await axios.get(url, {
        headers: { Authorization: token },
      });

      setAttendanceReport(response.data);
      setPage("attendanceReport");
    } catch (error) {
      console.log(error);
      alert("Attendance report failed ❌");
    }
  };

  const fetchTeacherAttendanceReport = async (dateFilter = "") => {
    try {
      const token = localStorage.getItem("token");

      const url = dateFilter
        ? `http://localhost:3000/teacher-attendance?date=${dateFilter}`
        : "http://localhost:3000/teacher-attendance";

      const response = await axios.get(url, {
        headers: { Authorization: token },
      });

      setTeacherAttendanceReport(response.data);
    } catch (error) {
      console.log(error);
      alert("Teacher attendance report failed ❌");
    }
  };

  const fetchBothAttendanceReports = async (dateFilter = "") => {
    await fetchAttendanceReport(dateFilter);
    await fetchTeacherAttendanceReport(dateFilter);
  };

  const fetchMarksReport = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:3000/marks",
        {
          headers: { Authorization: token },
        }
      );

      setMarksReport(response.data);
      setPage("marksReport");
    } catch (error) {
      console.log(error);
      alert("Failed loading marks report ❌");
    }
  };

  const updateDashboardStats = () => {
    const totalStudents = students.length;

    const presentToday = attendanceReport.filter(
      (row) => row.status === "Present"
    ).length;

    const absentToday = attendanceReport.filter(
      (row) => row.status === "Absent"
    ).length;

    const reports = marksReport.length;

    setDashboardStats({
      totalStudents,
      presentToday,
      absentToday,
      reports,
    });
  };

  useEffect(() => {
    updateDashboardStats();
  }, [students, attendanceReport, marksReport]);

  const fetchNotices = async (options = {}) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3000/notices", {
        headers: { Authorization: token },
      });
      setNotices(response.data);

      if (!options.silent) {
        setPage("notices");
      }
    } catch (error) {
      console.log(error);
      if (!options.silent) {
        alert("Failed loading notices");
      }
    }
  };

  // Quietly load notices for the dashboard ticker as soon as anyone logs in
  useEffect(() => {
    if (userRole === "admin" || userRole === "teacher") {
      fetchNotices({ silent: true });
    }
  }, [userRole]);

  const saveNotice = async () => {
    if (!noticeTitle.trim()) {
      alert("Please enter a notice title.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", noticeTitle);
      formData.append("message", noticeMessage);
      if (noticeAttachment) formData.append("attachment", noticeAttachment);

      await axios.post("http://localhost:3000/notices", formData, {
        headers: { Authorization: token },
      });

      alert("Notice created");
      setNoticeTitle("");
      setNoticeMessage("");
      setNoticeAttachment(null);
      setNoticeFileResetKey((prev) => prev + 1);
      fetchNotices();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Failed saving notice");
    }
  };

  const deleteNotice = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3000/notices/${id}`, {
        headers: { Authorization: token },
      });
      fetchNotices();
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  const fetchReportCard = async (studentId, exam) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:3000/marks/report/${studentId}?exam=${encodeURIComponent(
          exam
        )}`,
        {
          headers: { Authorization: token },
        }
      );

      setReportCard(response.data);
      setPage("reportCard");
    } catch (error) {
      console.log(error);
      alert("Report card failed ❌");
    }
  };

  const downloadReportCard = () => {
    if (!reportCard) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Student Report Card", 70, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${reportCard.name}`, 20, 40);
    doc.text(`Class: ${reportCard.class}`, 20, 50);
    doc.text(`Roll No: ${reportCard.roll_no}`, 20, 60);
    doc.text(`Exam: ${reportCard.exam}`, 20, 70);

    let y = 90;
    reportCard.subjects.forEach((s) => {
      doc.text(`${s.subject_name}: ${s.marks_obtained} / 100`, 20, y);
      y += 10;
    });

    y += 10;
    doc.text(`Total: ${reportCard.total} / ${reportCard.maxTotal}`, 20, y);
    doc.text(`Percentage: ${reportCard.percentage}%`, 20, y + 10);
    doc.text(`Grade: ${reportCard.grade}`, 20, y + 20);

    doc.save(`${reportCard.name}_report_card.pdf`);
  };

  if (loggedIn) {
    let pageContent = null;

    if (page === "addStudent") {
      pageContent = (
        <AddStudentPage
          student={student}
          handleStudentChange={handleStudentChange}
          handleSaveStudent={handleSaveStudent}
          handleFileChange={handleFileChange}
          fileInputResetKey={fileInputResetKey}
          editingStudentId={editingStudentId}
          setPage={setPage}
        />
      );
    } else if (page === "viewStudents") {
      pageContent = (
        <StudentPage
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          students={students}
          editStudent={editStudent}
          deleteStudent={deleteStudent}
          setPage={setPage}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          schoolName={schoolName}
          userRole={userRole}
        />
      );
    } else if (page === "attendance") {
      pageContent = (
        <AttendancePage
          students={students}
          setPage={setPage}
          saveAttendance={saveAttendance}
        />
      );
    } else if (page === "timetable") {
      pageContent = <TimetablePage setPage={setPage} />;
    } else if (page === "timetableView") {
      pageContent = <TimetableViewPage setPage={setPage} />;
    } else if (page === "mySchedule") {
      pageContent = <MySchedulePage setPage={setPage} />;
    } else if (page === "analytics") {
      pageContent = <AnalyticsPage setPage={setPage} />;
    } else if (page === "subjects") {
      pageContent = <SubjectsPage setPage={setPage} />;
    } else if (page === "manageTeachers") {
      pageContent = <ManageTeachersPage setPage={setPage} schoolName={schoolName} />;
    } else if (page === "teacherAttendance") {
      pageContent = <TeacherAttendancePage setPage={setPage} />;
    } else if (page === "adminProfile") {
      pageContent = <AdminProfilePage setPage={setPage} />;
    } else if (page === "teacherProfile") {
      pageContent = <TeacherProfilePage setPage={setPage} />;
    } else if (page === "teacherDiary") {
      pageContent = <TeacherDiaryPage students={students} setPage={setPage} />;
    } else if (page === "addMarks") {
      pageContent = (
        <MarksPage
          students={students}
          setPage={setPage}
        />
      );
    } else if (page === "attendanceReport") {
      pageContent = (
        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Attendance Report</h1>

            <div className="flex flex-wrap gap-4 items-end mb-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Filter by Date
                </label>
                <input
                  type="date"
                  value={reportDateFilter}
                  onChange={(e) => setReportDateFilter(e.target.value)}
                  className="border p-3 rounded-lg w-full"
                />
              </div>

              <button
                onClick={() => fetchBothAttendanceReports(reportDateFilter)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
              >
                Apply Filter
              </button>

              <button
                onClick={() => {
                  setReportDateFilter("");
                  fetchBothAttendanceReports();
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg"
              >
                Clear Filter
              </button>
            </div>

            <h2 className="text-xl md:text-2xl font-bold mb-4">Students</h2>
            <div className="overflow-x-auto mb-10">
              <table className="w-full border min-w-[500px]">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceReport.map((row) => (
                    <tr key={row.id} className="border-b text-center">
                      <td className="p-3">{row.name}</td>
                      <td className="p-3">{row.class}</td>
                      <td className="p-3">{row.date}</td>
                      <td className="p-3">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-xl md:text-2xl font-bold mb-4">Teachers</h2>
            <div className="overflow-x-auto">
              <table className="w-full border min-w-[500px]">
                <thead className="bg-teal-600 text-white">
                  <tr>
                    <th className="p-3">Teacher</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherAttendanceReport.map((row) => (
                    <tr key={row.id} className="border-b text-center">
                      <td className="p-3">{row.name}</td>
                      <td className="p-3">{row.email}</td>
                      <td className="p-3">{row.date}</td>
                      <td className="p-3">{row.status}</td>
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
    } else if (page === "marksReport") {
      const classOptions = [...new Set(marksReport.map((r) => r.class))];
      const examOptions = [...new Set(marksReport.map((r) => r.exam))];

      const filteredMarksReport = marksReport.filter((row) => {
        const matchesClass = marksClassFilter ? row.class === marksClassFilter : true;
        const matchesExam = marksExamFilter ? row.exam === marksExamFilter : true;
        const matchesName = marksNameFilter
          ? (row.name || "").toLowerCase().includes(marksNameFilter.toLowerCase())
          : true;
        return matchesClass && matchesExam && matchesName;
      });

      pageContent = (
        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Marks Report</h1>

            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={marksClassFilter}
                onChange={(e) => setMarksClassFilter(e.target.value)}
                className="border p-3 rounded-lg"
              >
                <option value="">All Classes</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>

              <select
                value={marksExamFilter}
                onChange={(e) => setMarksExamFilter(e.target.value)}
                className="border p-3 rounded-lg"
              >
                <option value="">All Exams</option>
                {examOptions.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search student name"
                value={marksNameFilter}
                onChange={(e) => setMarksNameFilter(e.target.value)}
                className="border p-3 rounded-lg flex-1 min-w-[200px]"
              />

              <button
                onClick={() => {
                  setMarksClassFilter("");
                  setMarksExamFilter("");
                  setMarksNameFilter("");
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg"
              >
                Clear Filters
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border min-w-[500px]">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Exam</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMarksReport.map((row) => (
                    <tr
                      key={`${row.student_id}-${row.exam}`}
                      className="border-b text-center"
                    >
                      <td className="p-3">{row.name}</td>
                      <td className="p-3">{row.class}</td>
                      <td className="p-3">{row.exam}</td>
                      <td className="p-3">
                        <button
                          onClick={() => fetchReportCard(row.student_id, row.exam)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                          Report Card
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredMarksReport.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">
                        No matching records found.
                      </td>
                    </tr>
                  )}
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
    } else if (page === "notices") {
      pageContent = (
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Notice Board</h1>

            {userRole === "admin" && (
              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  placeholder="Notice Title"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full border p-3 rounded-lg"
                />

                <textarea
                  placeholder="Notice Message"
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  className="w-full border p-3 rounded-lg"
                  rows="4"
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Attachment (optional)
                  </label>
                  <input
                    key={noticeFileResetKey}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={(e) => setNoticeAttachment(e.target.files[0] || null)}
                    className="w-full border p-3 rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, PDF, DOC, DOCX - max 5MB
                  </p>
                </div>

                <button
                  onClick={saveNotice}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                  Post Notice
                </button>
              </div>
            )}

            {notices.length === 0 ? (
              <p className="text-gray-500">No notices posted yet.</p>
            ) : (
              <div className="space-y-4">
                {notices.map((notice) => (
                  <div key={notice.id} className="border rounded-xl p-4 shadow-sm">
                    <h2 className="text-xl font-bold">{notice.title}</h2>
                    <p className="mt-2">{notice.message}</p>

                    {notice.attachment_path && (
                      <a
                        href={`http://localhost:3000${notice.attachment_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline text-sm mt-2 inline-block"
                      >
                        📎 View attachment
                      </a>
                    )}

                    {userRole === "admin" && (
                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg block"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setPage("dashboard")}
              className="mt-8 bg-gray-500 text-white px-6 py-3 rounded-lg"
            >
              Back
            </button>
          </div>
        </div>
      );
    } else if (page === "reportCard" && reportCard) {
      pageContent = (
        <div className="p-4 md:p-8">
          <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Report Card</h1>

            <p>Name: {reportCard.name}</p>
            <p>Class: {reportCard.class}</p>
            <p>Roll No: {reportCard.roll_no}</p>
            <p>Exam: {reportCard.exam}</p>

            <div className="overflow-x-auto">
              <table className="w-full border mt-4 mb-4 min-w-[300px]">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left">Subject</th>
                    <th className="p-2 text-left">Marks Obtained</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCard.subjects.map((s, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{s.subject_name}</td>
                      <td className="p-2">{s.marks_obtained} / 100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>Total: {reportCard.total} / {reportCard.maxTotal}</p>
            <p>Percentage: {reportCard.percentage}%</p>
            <p>Grade: {reportCard.grade}</p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={downloadReportCard}
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Download PDF
              </button>

              <button
                onClick={() => setPage("marksReport")}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default: Dashboard
    if (!pageContent) {
      const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
      };

      const todayLabel = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const totalMarked = dashboardStats.presentToday + dashboardStats.absentToday;
      const attendancePercent =
        totalMarked > 0
          ? Math.round((dashboardStats.presentToday / totalMarked) * 100)
          : null;

      pageContent = (
        <div className="p-4 md:p-8">
          {/* Greeting banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white rounded-3xl p-6 md:p-8 mb-8 shadow-lg">
            <div className="absolute -right-10 -top-14 w-48 h-48 bg-white/10 rounded-full"></div>
            <div className="absolute right-20 -bottom-16 w-32 h-32 bg-white/10 rounded-full"></div>

            <div className="relative">
              <p className="text-indigo-100 text-xs font-semibold tracking-widest uppercase">
                {todayLabel}
              </p>
              <h1 className="text-2xl md:text-4xl font-bold mt-1">
                {getGreeting()}
                {schoolName ? `, ${schoolName}` : ""}
              </h1>
              <p className="text-indigo-100 mt-2">
                {userRole === "admin"
                  ? "Here's how your school is doing today."
                  : "Here's your workspace for today."}
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                <FaUserGraduate />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Students</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {dashboardStats.totalStudents}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                <FaCheckCircle />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Present Today</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {dashboardStats.presentToday}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl">
                <FaTimesCircle />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Absent Today</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {dashboardStats.absentToday}
                </h2>
              </div>
            </div>
          </div>

          {/* Notices ticker + attendance rate */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[220px] flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBullhorn className="text-indigo-600" />
                Notices
              </h3>

              {notices.length === 0 ? (
                <p className="text-gray-400 text-sm py-10 text-center flex-1 flex items-center justify-center">
                  No notices posted yet.
                </p>
              ) : (
                <div className="flex-1 flex items-center overflow-hidden">
                  <style>{`
                    @keyframes noticeMarquee {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .notice-marquee-track {
                      display: flex;
                      width: max-content;
                      animation: noticeMarquee ${Math.max(notices.length * 8, 12)}s linear infinite;
                    }
                  `}</style>

                  <div className="notice-marquee-track">
                    {[...notices, ...notices].map((n, i) => (
                      <div
                        key={`${n.id}-${i}`}
                        onClick={() => setSelectedNotice(n)}
                        className="flex items-center whitespace-nowrap px-6 cursor-pointer hover:opacity-70 transition"
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-600 mr-3 shrink-0"></span>
                        <span className="text-gray-800 font-semibold">{n.title}</span>
                        <span className="text-gray-300 ml-6">•</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
              <p className="text-gray-500 text-sm font-medium mb-2">
                Today's Attendance Rate
              </p>
              <div className="text-5xl font-bold text-indigo-700">
                {attendancePercent !== null ? `${attendancePercent}%` : "—"}
              </div>
              <p className="text-gray-400 text-xs mt-3">
                {attendancePercent !== null
                  ? `${dashboardStats.presentToday} of ${totalMarked} marked present`
                  : "Awaiting today's attendance data"}
              </p>
            </div>
          </div>

          {selectedNotice && (
            <div
              onClick={() => setSelectedNotice(null)}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[500px] max-h-[85vh] overflow-y-auto shadow-2xl"
              >
                <p className="text-xs text-gray-400 mb-2">
                  {selectedNotice.created_at
                    ? new Date(selectedNotice.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {selectedNotice.title}
                </h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {selectedNotice.message}
                </p>

                {selectedNotice.attachment_path && (
                  <a
                    href={`http://localhost:3000${selectedNotice.attachment_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 underline text-sm mt-3 inline-block"
                  >
                    📎 View attachment
                  </a>
                )}

                <button
                  onClick={() => setSelectedNotice(null)}
                  className="mt-6 bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Persistent shell: Sidebar + TopBar wrap every page from here on
    return (
      <div className="flex bg-slate-50 min-h-screen">
        {/* Mobile backdrop - closes the sidebar when tapped */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}

        <Sidebar
          page={page}
          setPage={setPage}
          userRole={userRole}
          schoolName={schoolName}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          fetchStudents={fetchStudents}
          fetchAttendanceReport={fetchBothAttendanceReports}
          fetchMarksReport={fetchMarksReport}
          fetchNotices={fetchNotices}
          setLoggedIn={setLoggedIn}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            userRole={userRole}
            schoolName={schoolName}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <div className="flex-1 overflow-y-auto">{pageContent}</div>
        </div>
      </div>
    );
  }

  if (authView === "register") {
    return <RegisterPage setAuthView={setAuthView} />;
  }

  return (
    <LoginPage
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleLogin={handleLogin}
      setAuthView={setAuthView}
    />
  );
}

export default App;