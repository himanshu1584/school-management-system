const express = require("express");
const router = express.Router();
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyTeacher = require("../middlewares/verifyTeacher");
const verifyAdmin = require("../middlewares/verifyAdmin");

const MAX_MARKS_PER_SUBJECT = 100;

// SAVE marks (teachers only)
router.post("/", verifyToken, verifyTeacher, (req, res) => {
    const { student_id, exam, marks } = req.body;

    if (!student_id || !exam || !marks || marks.length === 0) {
        return res.status(400).json({
            error: "student_id, exam, and at least one subject's marks are required"
        });
    }

    let completed = 0;
    let hasError = false;

    marks.forEach((item) => {
        db.run(
            `INSERT INTO marks (school_id, student_id, exam, subject_name, marks_obtained)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.school_id, student_id, exam, item.subject_name, item.marks_obtained],
            function (err) {
                if (hasError) return;

                if (err) {
                    hasError = true;
                    return res.status(500).json({ error: err.message });
                }

                completed++;

                if (completed === marks.length) {
                    res.json({ message: "Marks saved successfully 📘" });
                }
            }
        );
    });
});

// GET all marks, grouped by student + exam (admin only - reporting view)
router.get("/", verifyToken, verifyAdmin, (req, res) => {
    db.all(
        `
        SELECT
            marks.student_id,
            marks.exam,
            students.name,
            students.class
        FROM marks
        LEFT JOIN students
        ON marks.student_id = students.id
        WHERE marks.school_id = ?
        GROUP BY marks.student_id, marks.exam
        ORDER BY marks.exam DESC
        `,
        [req.user.school_id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        }
    );
});

// GET full subject-wise report card for one student + one exam (admin only)
router.get("/report/:studentId", verifyToken, verifyAdmin, (req, res) => {
    const studentId = req.params.studentId;
    const exam = req.query.exam;

    if (!exam) {
        return res.status(400).json({
            error: "exam is required as a query parameter, e.g. ?exam=MidTerm"
        });
    }

    db.get(
        `SELECT name, class, roll_no FROM students WHERE id = ? AND school_id = ?`,
        [studentId, req.user.school_id],
        (err, student) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!student) {
                return res.status(404).json({
                    error: `No student found with ID ${studentId}`
                });
            }

            db.all(
                `SELECT subject_name, marks_obtained FROM marks
                 WHERE student_id = ? AND exam = ? AND school_id = ?`,
                [studentId, exam, req.user.school_id],
                (err, subjects) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    if (subjects.length === 0) {
                        return res.status(404).json({
                            error: "No marks found for this student and exam"
                        });
                    }

                    const total = subjects.reduce(
                        (sum, s) => sum + Number(s.marks_obtained),
                        0
                    );

                    const maxTotal = subjects.length * MAX_MARKS_PER_SUBJECT;
                    const percentage = (total / maxTotal) * 100;

                    let grade = "C";
                    if (percentage >= 90) grade = "A+";
                    else if (percentage >= 80) grade = "A";
                    else if (percentage >= 70) grade = "B";

                    res.json({
                        name: student.name,
                        class: student.class,
                        roll_no: student.roll_no,
                        exam,
                        subjects,
                        total,
                        maxTotal,
                        percentage: percentage.toFixed(2),
                        grade
                    });
                }
            );
        }
    );
});

module.exports = router;