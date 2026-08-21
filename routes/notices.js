const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { uploadNoticeAttachment } = require("../middlewares/upload");

// Create notice (admin only) - attachment file is optional
router.post("/", verifyToken, verifyAdmin, uploadNoticeAttachment, (req, res) => {
  const { title, message } = req.body;
  const created_at = new Date().toISOString();
  const attachmentPath = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO notices (school_id, title, message, attachment_path, created_at) VALUES (?, ?, ?, ?, ?)`,
    [req.user.school_id, title, message, attachmentPath, created_at],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "Notice created successfully",
        id: this.lastID,
      });
    }
  );
});

// Get all notices (both admin and teacher can view)
router.get("/", verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM notices WHERE school_id = ? ORDER BY id DESC`,
    [req.user.school_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

// Delete notice (admin only) - also removes the attachment file if there is one
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
  db.get(
    `SELECT attachment_path FROM notices WHERE id=? AND school_id=?`,
    [req.params.id, req.user.school_id],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.run(
        `DELETE FROM notices WHERE id=? AND school_id=?`,
        [req.params.id, req.user.school_id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: "Notice not found in your school" });
          }

          if (existing?.attachment_path) {
            const fullPath = path.join(__dirname, "..", existing.attachment_path);
            fs.unlink(fullPath, () => {});
          }

          res.json({ message: "Notice deleted" });
        }
      );
    }
  );
});

module.exports = router;