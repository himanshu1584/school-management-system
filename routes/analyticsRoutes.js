const express = require("express");
const router = express.Router();
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");

// Low attendance (<75%) - scoped to school
router.get("/low-attendance", verifyToken, (req, res) => {
  db.all(
    `
    SELECT student_id, COUNT(*) as total,
    SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present
    FROM attendance
    WHERE school_id = ?
    GROUP BY student_id
    `,
    [req.user.school_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const result = rows.map(r => {
        const percent = (r.present / r.total) * 100;
        return { ...r, percent };
      }).filter(r => r.percent < 75);

      res.json(result);
    }
  );
});

// Top scorers - average marks across all subjects/exams, scoped to school
router.get("/top-scorers", verifyToken, (req, res) => {
  db.all(
    `
    SELECT s.name, s.class,
    AVG(m.marks_obtained) as avgScore
    FROM marks m
    JOIN students s ON s.id = m.student_id
    WHERE m.school_id = ?
    GROUP BY m.student_id
    ORDER BY avgScore DESC
    LIMIT 5
    `,
    [req.user.school_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Weak in a specific subject (subject is now dynamic, so it must be provided)
// e.g. GET /analytics/weak-subject?subject=Math&threshold=40
router.get("/weak-subject", verifyToken, (req, res) => {
  const subject = req.query.subject;
  const threshold = req.query.threshold ? Number(req.query.threshold) : 40;

  if (!subject) {
    return res.status(400).json({
      error: "subject is required as a query parameter, e.g. ?subject=Math"
    });
  }

  db.all(
    `
    SELECT s.name, m.marks_obtained
    FROM marks m
    JOIN students s ON s.id = m.student_id
    WHERE m.school_id = ? AND m.subject_name = ? AND m.marks_obtained < ?
    `,
    [req.user.school_id, subject, threshold],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;