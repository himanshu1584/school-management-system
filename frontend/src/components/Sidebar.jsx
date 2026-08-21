import {
  FaTachometerAlt,
  FaUserGraduate,
  FaClipboardCheck,
  FaChartBar,
  FaChartLine,
  FaCalendarAlt,
  FaClock,
  FaBullhorn,
  FaSignOutAlt,
  FaPen,
  FaBook,
  FaBookOpen,
  FaChalkboardTeacher,
  FaTimes,
} from "react-icons/fa";

function Sidebar({
  page,
  setPage,
  userRole,
  schoolName,
  sidebarOpen,
  setSidebarOpen,
  fetchStudents,
  fetchAttendanceReport,
  fetchMarksReport,
  fetchNotices,
  setLoggedIn,
}) {
  const itemStyle = (active) =>
    `w-full flex items-start gap-3 px-4 py-3.5 text-[15px] font-medium rounded-lg transition-all duration-150 leading-tight border-l-4 [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:w-5 [&>svg]:h-5 ${
      active
        ? "bg-gray-800 text-red-500 border-red-500"
        : "text-gray-300 border-transparent hover:bg-gray-800/70 hover:text-white"
    }`;

  const getSchoolNameSize = (name) => {
    const length = name ? name.length : 0;
    if (length <= 10) return "text-lg";
    if (length <= 18) return "text-base";
    if (length <= 28) return "text-sm";
    return "text-xs";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLoggedIn(false);
  };

  // Navigate + auto-close the drawer on mobile, and run any fetch side-effect first
  const go = (pageName, sideEffect) => {
    if (sideEffect) sideEffect();
    setPage(pageName);
    setSidebarOpen(false);
  };

  return (
    <div
      className={`fixed lg:static inset-y-0 left-0 z-40 w-[280px] shrink-0 min-h-screen bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {/* Brand band */}
      <div className="bg-red-600 text-white text-center py-5 px-4 flex items-center justify-center relative">
        <h1 className="text-xl font-bold tracking-wide">School ERP</h1>

        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 text-white lg:hidden"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* School name / profile */}
        <div
          onClick={() => go(userRole === "admin" ? "adminProfile" : "teacherProfile")}
          className="bg-gray-800 rounded-xl p-4 mb-6 text-center transition cursor-pointer hover:bg-gray-700"
        >
          <p
            className={`text-gray-100 font-semibold leading-snug ${
              userRole === "admin" ? getSchoolNameSize(schoolName) : "text-lg"
            }`}
          >
            {userRole === "admin" ? schoolName : "Teacher Portal"}
          </p>

          <p className="text-xs text-gray-400 mt-1">Tap to view profile</p>
        </div>

        {/* Menu */}
        <div className="space-y-1.5 flex-1">
          <button
            onClick={() => go("dashboard")}
            className={itemStyle(page === "dashboard")}
          >
            <FaTachometerAlt />
            Dashboard
          </button>

          {userRole === "admin" && (
            <>
              <button
                onClick={() => go("viewStudents", fetchStudents)}
                className={itemStyle(page === "viewStudents")}
              >
                <FaUserGraduate />
                View Students
              </button>

              <button
                onClick={() => go("attendanceReport", fetchAttendanceReport)}
                className={itemStyle(page === "attendanceReport")}
              >
                <FaChartBar />
                Attendance Report
              </button>

              <button
                onClick={() => go("teacherAttendance")}
                className={itemStyle(page === "teacherAttendance")}
              >
                <FaClock className="-mr-1.5" />
                Mark Teacher Attendance
              </button>

              <button
                onClick={() => go("marksReport", fetchMarksReport)}
                className={itemStyle(page === "marksReport")}
              >
                <FaChartBar />
                Marks Report
              </button>

              <button
                onClick={() => go("analytics")}
                className={itemStyle(page === "analytics")}
              >
                <FaChartLine />
                Analytics
              </button>

              <button
                onClick={() => go("manageTeachers")}
                className={itemStyle(page === "manageTeachers")}
              >
                <FaChalkboardTeacher />
                Manage Teachers
              </button>

              <button
                onClick={() => go("timetable")}
                className={itemStyle(page === "timetable")}
              >
                <FaCalendarAlt />
                Timetable
              </button>

              <button
                onClick={() => go("subjects")}
                className={itemStyle(page === "subjects")}
              >
                <FaBook />
                Subjects
              </button>

              <button
                onClick={() => go("notices", fetchNotices)}
                className={itemStyle(page === "notices")}
              >
                <FaBullhorn />
                Notice Board
              </button>
            </>
          )}

          {userRole === "teacher" && (
            <>
              <button
                onClick={() => go("addStudent")}
                className={itemStyle(page === "addStudent")}
              >
                <FaUserGraduate />
                Add Student
              </button>

              <button
                onClick={() => go("viewStudents", fetchStudents)}
                className={itemStyle(page === "viewStudents")}
              >
                <FaUserGraduate />
                View Students
              </button>

              <button
                onClick={() => go("attendance", fetchStudents)}
                className={itemStyle(page === "attendance")}
              >
                <FaClipboardCheck />
                Attendance
              </button>

              <button
                onClick={() => go("addMarks", fetchStudents)}
                className={itemStyle(page === "addMarks")}
              >
                <FaPen />
                Add Marks
              </button>

              <button
                onClick={() => go("timetableView")}
                className={itemStyle(page === "timetableView")}
              >
                <FaCalendarAlt />
                Timetable
              </button>

              <button
                onClick={() => go("mySchedule")}
                className={itemStyle(page === "mySchedule")}
              >
                <FaClock className="-mr-1.5" />
                My Schedule
              </button>

              <button
                onClick={() => go("teacherDiary")}
                className={itemStyle(page === "teacherDiary")}
              >
                <FaBookOpen />
                Diary
              </button>

              <button
                onClick={() => go("notices", fetchNotices)}
                className={itemStyle(page === "notices")}
              >
                <FaBullhorn />
                Notice Board
              </button>
            </>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg font-medium border-t border-gray-800 mt-4 pt-5"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;