const express = require("express");
const router = express.Router();
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");

const HELP_TEXT =
  "I can answer things like:\n" +
  "• \"Who was absent today?\"\n" +
  "• \"Who was present today?\"\n" +
  "• \"Top 5 students\"\n" +
  "• \"Class 10 result\"\n" +
  "• \"Low attendance students\"\n" +
  "• \"Weak in Math\"";

router.post("/ask", verifyToken, (req, res) => {
  const question = (req.body.question || "").trim();
  const q = question.toLowerCase();
  const schoolId = req.user.school_id;

  if (!question) {
    return res.json({ answer: HELP_TEXT });
  }

  // 1) "Who was absent today?"
  if (q.includes("absent") && q.includes("today")) {
    const today = new Date().toISOString().split("T")[0];

    db.all(
      `SELECT students.name, students.class
       FROM attendance
       LEFT JOIN students ON attendance.student_id = students.id
       WHERE attendance.school_id = ? AND attendance.date = ? AND attendance.status = 'Absent'`,
      [schoolId, today],
      (err, rows) => {
        if (err) return res.status(500).json({ answer: "Something went wrong looking that up." });

        if (rows.length === 0) {
          return res.json({ answer: "No students were marked absent today. 🎉" });
        }

        const list = rows.map((r) => `• ${r.name} (Class ${r.class})`).join("\n");
        res.json({ answer: `${rows.length} student(s) were absent today:\n${list}` });
      }
    );
    return;
  }

  // 2) "Who was present today?"
  if (q.includes("present") && q.includes("today")) {
    const today = new Date().toISOString().split("T")[0];

    db.all(
      `SELECT students.name, students.class
       FROM attendance
       LEFT JOIN students ON attendance.student_id = students.id
       WHERE attendance.school_id = ? AND attendance.date = ? AND attendance.status = 'Present'`,
      [schoolId, today],
      (err, rows) => {
        if (err) return res.status(500).json({ answer: "Something went wrong looking that up." });

        if (rows.length === 0) {
          return res.json({ answer: "No attendance has been marked as Present today yet." });
        }

        const list = rows.map((r) => `• ${r.name} (Class ${r.class})`).join("\n");
        res.json({ answer: `${rows.length} student(s) were present today:\n${list}` });
      }
    );
    return;
  }

  // 3) "Top N students" (e.g. "top 5 students", "top students")
  const topMatch = q.match(/top\s*(\d+)?\s*students?/);
  if (topMatch) {
    const limit = topMatch[1] ? parseInt(topMatch[1], 10) : 5;

    db.all(
      `SELECT s.name, s.class, AVG(m.marks_obtained) as avgScore
       FROM marks m
       JOIN students s ON s.id = m.student_id
       WHERE m.school_id = ?
       GROUP BY m.student_id
       ORDER BY avgScore DESC
       LIMIT ?`,
      [schoolId, limit],
      (err, rows) => {
        if (err) return res.status(500).json({ answer: "Something went wrong looking that up." });

        if (rows.length === 0) {
          return res.json({ answer: "No marks have been recorded yet, so I can't rank students." });
        }

        const list = rows
          .map((r, i) => `${i + 1}. ${r.name} (Class ${r.class}) - ${r.avgScore.toFixed(2)} avg`)
          .join("\n");
        res.json({ answer: `Top ${rows.length} student(s) by average marks:\n${list}` });
      }
    );
    return;
  }

  // 4) "Class X result" / "result for class X" / "generate class X result"
  const classMatch = q.match(/class\s*([a-z0-9]+)/);
  if (classMatch && q.includes("result")) {
    const className = classMatch[1];

    db.all(
      `SELECT s.name, AVG(m.marks_obtained) as avgScore
       FROM marks m
       JOIN students s ON s.id = m.student_id
       WHERE m.school_id = ? AND s.class = ?
       GROUP BY m.student_id
       ORDER BY avgScore DESC`,
      [schoolId, className],
      (err, rows) => {
        if (err) return res.status(500).json({ answer: "Something went wrong looking that up." });

        if (rows.length === 0) {
          return res.json({
            answer: `No marks have been recorded yet for Class ${className}.`,
          });
        }

        const list = rows
          .map((r, i) => `${i + 1}. ${r.name} - ${r.avgScore.toFixed(2)}% avg`)
          .join("\n");
        res.json({ answer: `Result summary for Class ${className}:\n${list}` });
      }
    );
    return;
  }

  // 5) "Low attendance students"
  if (q.includes("low attendance")) {
    db.all(
      `SELECT students.name, students.class, attendance.student_id,
              COUNT(*) as total,
              SUM(CASE WHEN attendance.status='Present' THEN 1 ELSE 0 END) as present
       FROM attendance
       LEFT JOIN students ON attendance.student_id = students.id
       WHERE attendance.school_id = ?
       GROUP BY attendance.student_id`,
      [schoolId],
      (err, rows) => {
        if (err) return res.status(500).json({ answer: "Something went wrong looking that up." });

        const weak = rows
          .map((r) => ({ ...r, percent: (r.present / r.total) * 100 }))
          .filter((r) => r.percent < 75);

        if (weak.length === 0) {
          return res.json({ answer: "No students currently have low attendance (below 75%). 🎉" });
        }

        const list = weak
          .map((r) => `• ${r.name} (Class ${r.class}) - ${r.percent.toFixed(1)}%`)
          .join("\n");
        res.json({ answer: `Students with low attendance (below 75%):\n${list}` });
      }
    );
    return;
  }

  // 6) "Weak in <subject>"
  const weakMatch = q.match(/weak in ([a-z ]+)/);
  if (weakMatch) {
    const subject = weakMatch[1].trim();

    db.all(
      `SELECT s.name, m.marks_obtained
       FROM marks m
       JOIN students s ON s.id = m.student_id
       WHERE m.school_id = ? AND LOWER(m.subject_name) = ? AND m.marks_obtained < 40`,
      [schoolId, subject],
      (err, rows) => {
        if (err) return res.status(500).json({ answer: "Something went wrong looking that up." });

        if (rows.length === 0) {
          return res.json({
            answer: `No students are currently scoring below 40 in "${subject}" (or that subject has no marks recorded).`,
          });
        }

        const list = rows.map((r) => `• ${r.name} - ${r.marks_obtained}`).join("\n");
        res.json({ answer: `Students weak in ${subject}:\n${list}` });
      }
    );
    return;
  }

  // Fallback - nothing matched
  res.json({
    answer: `I'm not sure how to answer that yet.\n\n${HELP_TEXT}`,
  });
});

module.exports = router;