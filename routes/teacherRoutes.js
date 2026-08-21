const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyTeacher = require("../middlewares/verifyTeacher");
const { uploadTeacherPhoto } = require("../middlewares/upload");

// Teacher deletes their own account (self only, never someone else's)
router.delete("/me", verifyToken, verifyTeacher, (req, res) => {
    db.get(
        `SELECT photo_path FROM teachers WHERE id = ?`,
        [req.user.teacherId],
        (err, existing) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.run(
                `DELETE FROM teachers WHERE id = ?`,
                [req.user.teacherId],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({ error: "Account not found" });
                    }

                    if (existing?.photo_path) {
                        const fullPath = path.join(__dirname, "..", existing.photo_path);
                        fs.unlink(fullPath, () => {});
                    }

                    res.json({ message: "Your account has been deleted" });
                }
            );
        }
    );
});

// Teacher uploads/changes their own profile photo (self only, never someone else's)
router.put("/me/photo", verifyToken, verifyTeacher, uploadTeacherPhoto, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No photo file was uploaded" });
    }

    const photoPath = `/uploads/${req.file.filename}`;

    db.run(
        `UPDATE teachers SET photo_path = ? WHERE id = ?`,
        [photoPath, req.user.teacherId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: "Profile photo updated ✅",
                photo_path: photoPath
            });
        }
    );
});

// GET all teachers belonging to the logged-in admin's school
router.get("/", verifyToken, verifyAdmin, (req, res) => {
    db.all(
        `SELECT id, name, phone, email, is_approved, photo_path, created_at
         FROM teachers
         WHERE school_id = ?
         ORDER BY created_at DESC`,
        [req.user.school_id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

// APPROVE a teacher (only within the admin's own school)
router.put("/:id/approve", verifyToken, verifyAdmin, (req, res) => {
    db.run(
        `UPDATE teachers SET is_approved = 1 WHERE id = ? AND school_id = ?`,
        [req.params.id, req.user.school_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Teacher not found in your school"
                });
            }

            res.json({ message: "Teacher approved ✅" });
        }
    );
});

// REMOVE a teacher (only within the admin's own school)
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
    db.run(
        `DELETE FROM teachers WHERE id = ? AND school_id = ?`,
        [req.params.id, req.user.school_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Teacher not found in your school"
                });
            }

            res.json({ message: "Teacher removed 🗑️" });
        }
    );
});

module.exports = router;