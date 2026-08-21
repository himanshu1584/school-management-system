const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyTeacher = require("../middlewares/verifyTeacher");
const { uploadStudentDocs } = require("../middlewares/upload");

// Renumbers every student in a class (1, 2, 3...) in alphabetical order by name.
// Calls callback(err) when done - callback(null) on success.
function renumberClass(schoolId, className, callback) {
    if (!className) {
        return callback(null);
    }

    db.all(
        `SELECT id FROM students
         WHERE school_id = ? AND class = ?
         ORDER BY LOWER(name) ASC, id ASC`,
        [schoolId, className],
        (err, rows) => {
            if (err) return callback(err);

            if (rows.length === 0) return callback(null);

            let completed = 0;
            let hasError = false;

            rows.forEach((row, index) => {
                db.run(
                    `UPDATE students SET roll_no = ? WHERE id = ?`,
                    [index + 1, row.id],
                    (err) => {
                        if (hasError) return;

                        if (err) {
                            hasError = true;
                            return callback(err);
                        }

                        completed++;
                        if (completed === rows.length) callback(null);
                    }
                );
            });
        }
    );
}

// GET all students OR filter by class (both admin and teacher can view)
router.get("/", verifyToken, (req, res) => {
    const selectedClass = req.query.class;

    let sql = "SELECT * FROM students WHERE school_id = ?";
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

// POST student (teachers only) - roll number is assigned automatically
router.post("/", verifyToken, verifyTeacher, uploadStudentDocs, (req, res) => {
    const {
        name,
        class: studentClass,
        father_name,
        mother_name,
        apaar_id,
        pen_number,
        ifsc,
        account_number,
        srn_number
    } = req.body;

    const photoPath = req.files?.photo ? `/uploads/${req.files.photo[0].filename}` : null;
    const aadhaarPath = req.files?.aadhaar ? `/uploads/${req.files.aadhaar[0].filename}` : null;
    const birthCertPath = req.files?.birth_certificate
        ? `/uploads/${req.files.birth_certificate[0].filename}`
        : null;

    db.run(
        `INSERT INTO students
        (school_id, name, class, roll_no, father_name, mother_name, apaar_id, pen_number, ifsc, account_number, srn_number, photo_path, aadhaar_path, birth_certificate_path)
        VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            req.user.school_id,
            name,
            studentClass,
            father_name,
            mother_name,
            apaar_id,
            pen_number,
            ifsc,
            account_number,
            srn_number,
            photoPath,
            aadhaarPath,
            birthCertPath
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const newStudentId = this.lastID;

            renumberClass(req.user.school_id, studentClass, (renumberErr) => {
                if (renumberErr) {
                    return res.status(500).json({ error: renumberErr.message });
                }

                res.json({
                    message: "Student saved successfully 🚀",
                    studentId: newStudentId
                });
            });
        }
    );
});

// UPDATE student (teachers only) - keeps existing documents if no new file is uploaded.
// Roll number is recalculated automatically for the affected class(es).
router.put("/:id", verifyToken, verifyTeacher, uploadStudentDocs, (req, res) => {
    const studentId = req.params.id;

    const {
        name,
        class: studentClass,
        father_name,
        mother_name,
        apaar_id,
        pen_number,
        ifsc,
        account_number,
        srn_number
    } = req.body;

    db.get(
        `SELECT class, photo_path, aadhaar_path, birth_certificate_path FROM students WHERE id = ? AND school_id = ?`,
        [studentId, req.user.school_id],
        (err, existing) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!existing) {
                return res.status(404).json({ error: "Student not found in your school" });
            }

            const previousClass = existing.class;

            const photoPath = req.files?.photo
                ? `/uploads/${req.files.photo[0].filename}`
                : existing.photo_path;

            const aadhaarPath = req.files?.aadhaar
                ? `/uploads/${req.files.aadhaar[0].filename}`
                : existing.aadhaar_path;

            const birthCertPath = req.files?.birth_certificate
                ? `/uploads/${req.files.birth_certificate[0].filename}`
                : existing.birth_certificate_path;

            db.run(
                `UPDATE students
                 SET name=?, class=?, father_name=?, mother_name=?, apaar_id=?, pen_number=?, ifsc=?, account_number=?, srn_number=?, photo_path=?, aadhaar_path=?, birth_certificate_path=?
                 WHERE id=? AND school_id=?`,
                [
                    name,
                    studentClass,
                    father_name,
                    mother_name,
                    apaar_id,
                    pen_number,
                    ifsc,
                    account_number,
                    srn_number,
                    photoPath,
                    aadhaarPath,
                    birthCertPath,
                    studentId,
                    req.user.school_id
                ],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({
                            error: "Student not found in your school"
                        });
                    }

                    // Renumber the new class, and the old class too if it changed
                    renumberClass(req.user.school_id, studentClass, (err1) => {
                        if (err1) {
                            return res.status(500).json({ error: err1.message });
                        }

                        if (previousClass && previousClass !== studentClass) {
                            renumberClass(req.user.school_id, previousClass, (err2) => {
                                if (err2) {
                                    return res.status(500).json({ error: err2.message });
                                }

                                res.json({ message: "Student updated successfully ✏️" });
                            });
                        } else {
                            res.json({ message: "Student updated successfully ✏️" });
                        }
                    });
                }
            );
        }
    );
});

// DELETE student (teachers only) - also removes any uploaded document files,
// then renumbers whoever is left in that class
router.delete("/:id", verifyToken, verifyTeacher, (req, res) => {
    const studentId = req.params.id;

    db.get(
        `SELECT class, photo_path, aadhaar_path, birth_certificate_path FROM students WHERE id = ? AND school_id = ?`,
        [studentId, req.user.school_id],
        (err, existing) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.run(
                "DELETE FROM students WHERE id = ? AND school_id = ?",
                [studentId, req.user.school_id],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({
                            error: "Student not found in your school"
                        });
                    }

                    // Best-effort cleanup of uploaded files - ignore errors
                    // (e.g. file already missing) since the student record
                    // is already deleted either way.
                    if (existing) {
                        [existing.photo_path, existing.aadhaar_path, existing.birth_certificate_path]
                            .filter(Boolean)
                            .forEach((relativePath) => {
                                const fullPath = path.join(__dirname, "..", relativePath);
                                fs.unlink(fullPath, () => {});
                            });
                    }

                    renumberClass(req.user.school_id, existing?.class, (renumberErr) => {
                        if (renumberErr) {
                            return res.status(500).json({ error: renumberErr.message });
                        }

                        res.json({
                            message: "Student deleted successfully 🗑️"
                        });
                    });
                }
            );
        }
    );
});

module.exports = router;