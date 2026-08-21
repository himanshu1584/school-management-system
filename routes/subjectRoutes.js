const express = require("express");
const router = express.Router();
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");

// GET subjects (optionally filtered by class) - both admin and teacher can view
// (teachers need this to pick subjects when adding marks or writing diary entries)
router.get("/", verifyToken, (req, res) => {
    const selectedClass = req.query.class;

    let sql = "SELECT * FROM subjects WHERE school_id = ?";
    let params = [req.user.school_id];

    if (selectedClass) {
        sql += " AND class = ?";
        params.push(selectedClass);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// ADD a subject to a class (admin only)
router.post("/", verifyToken, verifyAdmin, (req, res) => {
    const { class: className, subject_name } = req.body;

    if (!className || !subject_name || !subject_name.trim()) {
        return res.status(400).json({
            error: "Class and subject name are required"
        });
    }

    db.run(
        `INSERT INTO subjects (school_id, class, subject_name) VALUES (?, ?, ?)`,
        [req.user.school_id, className, subject_name.trim()],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: "Subject added successfully 📚",
                id: this.lastID
            });
        }
    );
});

// DELETE a subject (admin only)
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
    db.run(
        "DELETE FROM subjects WHERE id = ? AND school_id = ?",
        [req.params.id, req.user.school_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Subject not found in your school" });
            }

            res.json({ message: "Subject deleted successfully 🗑️" });
        }
    );
});

module.exports = router;