const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");

// Admin only - report cards are part of the reporting/oversight features
router.get("/report/:id", verifyToken, verifyAdmin, (req, res) => {
  const studentId = req.params.id;
  const exam = req.query.exam;

  if (!exam) {
    return res.status(400).json({
      error: "exam is required as a query parameter, e.g. ?exam=MidTerm"
    });
  }

  db.get(
    `SELECT * FROM students WHERE id = ? AND school_id = ?`,
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
        (err, marks) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const doc = new PDFDocument();

          res.setHeader(
            "Content-Type",
            "application/pdf"
          );

          doc.pipe(res);

          doc.fontSize(20).text("Report Card", { align: "center" });
          doc.moveDown();

          doc.fontSize(14).text(`Name: ${student.name}`);
          doc.text(`Class: ${student.class}`);
          doc.text(`Roll No: ${student.roll_no}`);
          doc.text(`Exam: ${exam}`);

          doc.moveDown();

          if (marks.length === 0) {
            doc.text("No marks recorded yet for this exam.");
          } else {
            marks.forEach((m) => {
              doc.text(`${m.subject_name}: ${m.marks_obtained} / 100`);
            });
          }

          doc.end();
        }
      );
    }
  );
});

module.exports = router;