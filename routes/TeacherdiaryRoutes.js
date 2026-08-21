const express = require("express");
const router = express.Router();
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyTeacher = require("../middlewares/verifyTeacher");

// ADD a diary entry (teachers only)
router.post("/", verifyToken, verifyTeacher, (req, res) => {
    const { class: className, subject_name, date, topic } = req.body;

    if (!className || !subject_name || !date || !topic || !topic.trim()) {
        return res.status(400).json({
            error: "Class, subject, date, and topic taught are all required"
        });
    }

    const createdAt = new Date().toISOString();

    db.run(
        `INSERT INTO teacher_diary (school_id, teacher_id, class, subject_name, date, topic, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.school_id, req.user.teacherId, className, subject_name, date, topic.trim(), createdAt],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: "Diary entry saved successfully 📔",
                id: this.lastID
            });
        }
    );
});

// GET diary entries
// - Teacher: sees only their own entries
// - Admin: sees every teacher's entries (with teacher name attached)
router.get("/", verifyToken, (req, res) => {
    const { class: classFilter, subject, date } = req.query;

    let sql, params;

    if (req.user.role === "teacher") {
        sql = `
            SELECT teacher_diary.*
            FROM teacher_diary
            WHERE teacher_diary.school_id = ? AND teacher_diary.teacher_id = ?
        `;
        params = [req.user.school_id, req.user.teacherId];
    } else {
        sql = `
            SELECT
                teacher_diary.*,
                teachers.name AS teacher_name
            FROM teacher_diary
            LEFT JOIN teachers ON teacher_diary.teacher_id = teachers.id
            WHERE teacher_diary.school_id = ?
        `;
        params = [req.user.school_id];
    }

    if (classFilter) {
        sql += " AND teacher_diary.class = ?";
        params.push(classFilter);
    }

    if (subject) {
        sql += " AND teacher_diary.subject_name = ?";
        params.push(subject);
    }

    if (date) {
        sql += " AND teacher_diary.date = ?";
        params.push(date);
    }

    sql += " ORDER BY teacher_diary.date DESC, teacher_diary.id DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;