const express = require("express");
const router = express.Router();
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyTeacher = require("../middlewares/verifyTeacher");
const verifyAdmin = require("../middlewares/verifyAdmin");

// SAVE attendance (teachers only - they're the ones marking it)
router.post("/", verifyToken, verifyTeacher, (req, res) => {
    const { attendance } = req.body;

    if (!attendance || attendance.length === 0) {
        return res.status(400).json({
            error: "Attendance data required"
        });
    }

    let completed = 0;
    let hasError = false; // prevents sending response more than once

    attendance.forEach((record) => {
        db.run(
            `INSERT INTO attendance (school_id, student_id, class, date, status)
             VALUES (?, ?, ?, ?, ?)`,
            [
                req.user.school_id,
                record.student_id,
                record.class,
                record.date,
                record.status
            ],
            function (err) {
                if (hasError) return; // a previous record already failed, stop here

                if (err) {
                    hasError = true;
                    return res.status(500).json({
                        error: err.message
                    });
                }

                completed++;

                if (completed === attendance.length) {
                    res.json({
                        message: "Attendance saved successfully ✅"
                    });
                }
            }
        );
    });
});

// GET attendance report (admin only - this is the oversight/reporting view)
router.get("/", verifyToken, verifyAdmin, (req, res) => {
    const selectedDate = req.query.date;

    let sql = `
        SELECT 
            attendance.id,
            attendance.class,
            attendance.date,
            attendance.status,
            students.name,
            students.roll_no
        FROM attendance
        LEFT JOIN students
        ON attendance.student_id = students.id
        WHERE attendance.school_id = ?
    `;

    let params = [req.user.school_id];

    if (selectedDate) {
        sql += " AND attendance.date = ?";
        params.push(selectedDate);
    }

    sql += " ORDER BY attendance.date DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});

module.exports = router;