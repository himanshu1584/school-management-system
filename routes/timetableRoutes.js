const express = require("express");
const router = express.Router();
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");

// GET timetable for a class (both roles can view), with subject + teacher name
router.get("/", verifyToken, (req, res) => {
    const selectedClass = req.query.class;

    let sql = `
        SELECT
            timetable_slots.*,
            teachers.name AS teacher_name
        FROM timetable_slots
        LEFT JOIN teachers ON timetable_slots.teacher_id = teachers.id
        WHERE timetable_slots.school_id = ?
    `;
    let params = [req.user.school_id];

    if (selectedClass) {
        sql += " AND timetable_slots.class = ?";
        params.push(selectedClass);
    }

    sql += " ORDER BY timetable_slots.day, timetable_slots.period_number";

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET the logged-in teacher's own schedule, across every class/day (teacher only)
router.get("/my-schedule", verifyToken, (req, res) => {
    if (req.user.role !== "teacher") {
        return res.status(403).json({ error: "Access denied. Teachers only." });
    }

    db.all(
        `SELECT * FROM timetable_slots
         WHERE school_id = ? AND teacher_id = ?
         ORDER BY day, period_number`,
        [req.user.school_id, req.user.teacherId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

// SET (add or update) a single period slot (admin only)
// If a slot already exists for this class+day+period, it's replaced.
router.post("/", verifyToken, verifyAdmin, (req, res) => {
    const { class: className, day, period_number, subject_name, teacher_id } = req.body;

    if (!className || !day || !period_number || !subject_name) {
        return res.status(400).json({
            error: "Class, day, period number, and subject are required"
        });
    }

    db.get(
        `SELECT id FROM timetable_slots WHERE school_id = ? AND class = ? AND day = ? AND period_number = ?`,
        [req.user.school_id, className, day, period_number],
        (err, existing) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (existing) {
                db.run(
                    `UPDATE timetable_slots SET subject_name = ?, teacher_id = ? WHERE id = ?`,
                    [subject_name, teacher_id || null, existing.id],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json({ message: "Period updated ✅", id: existing.id });
                    }
                );
            } else {
                db.run(
                    `INSERT INTO timetable_slots (school_id, class, day, period_number, subject_name, teacher_id)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [req.user.school_id, className, day, period_number, subject_name, teacher_id || null],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json({ message: "Period saved ✅", id: this.lastID });
                    }
                );
            }
        }
    );
});

// DELETE a period slot (admin only)
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
    db.run(
        "DELETE FROM timetable_slots WHERE id = ? AND school_id = ?",
        [req.params.id, req.user.school_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Slot not found in your school" });
            }

            res.json({ success: true });
        }
    );
});

module.exports = router;