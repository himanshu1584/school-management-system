const express = require("express");
const router = express.Router();
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");

// SAVE teacher attendance (admin only) - can save multiple teachers at once
router.post("/", verifyToken, verifyAdmin, (req, res) => {
    const { attendance } = req.body;

    if (!attendance || attendance.length === 0) {
        return res.status(400).json({
            error: "Attendance data required"
        });
    }

    let completed = 0;
    let hasError = false;

    attendance.forEach((record) => {
        db.run(
            `INSERT INTO teacher_attendance (school_id, teacher_id, date, status)
             VALUES (?, ?, ?, ?)`,
            [req.user.school_id, record.teacher_id, record.date, record.status],
            function (err) {
                if (hasError) return;

                if (err) {
                    hasError = true;
                    return res.status(500).json({ error: err.message });
                }

                completed++;

                if (completed === attendance.length) {
                    res.json({ message: "Teacher attendance saved successfully ✅" });
                }
            }
        );
    });
});

// GET teacher attendance report (admin only), optional date filter
router.get("/", verifyToken, verifyAdmin, (req, res) => {
    const selectedDate = req.query.date;

    let sql = `
        SELECT
            teacher_attendance.id,
            teacher_attendance.date,
            teacher_attendance.status,
            teachers.name,
            teachers.email
        FROM teacher_attendance
        LEFT JOIN teachers
        ON teacher_attendance.teacher_id = teachers.id
        WHERE teacher_attendance.school_id = ?
    `;

    let params = [req.user.school_id];

    if (selectedDate) {
        sql += " AND teacher_attendance.date = ?";
        params.push(selectedDate);
    }

    sql += " ORDER BY teacher_attendance.date DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;