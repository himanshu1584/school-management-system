const express = require("express");
const db = require("./database/db");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware (IMPORTANT)
app.use(cors());
app.use(express.json());


// Routes
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const studentRoutes = require("./routes/studentRoutes");
app.use("/students", studentRoutes);
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);
const attendanceRoutes = require("./routes/attendanceRoutes");
app.use("/attendance", attendanceRoutes);
const marksRoutes = require("./routes/marksRoutes");
app.use("/marks", marksRoutes);
const noticeRoutes = require("./routes/notices");
app.use("/notices", noticeRoutes);
const timetableRoutes = require("./routes/timetableRoutes");
app.use("/timetable", timetableRoutes);
const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/analytics", analyticsRoutes);
const pdfRoutes = require("./routes/pdfRoutes");
app.use("/pdf", pdfRoutes);
const subjectRoutes = require("./routes/subjectRoutes");
app.use("/subjects", subjectRoutes);
const teacherRoutes = require("./routes/teacherRoutes");
app.use("/teachers", teacherRoutes);
const teacherAttendanceRoutes = require("./routes/teacherAttendanceRoutes");
app.use("/teacher-attendance", teacherAttendanceRoutes);
// Home route
app.get("/", (req, res) => {
    res.send("School Management System Backend is Running 🚀");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});