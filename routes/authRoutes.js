const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const verifyToken = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");

const SECRET_KEY = "school_secret_key";

// REGISTER — handles both Admin (creates a school) and Teacher (joins a school)
router.post("/register", (req, res) => {
  const { role, email, password } = req.body;

  if (role !== "admin" && role !== "teacher") {
    return res.status(400).json({
      message: "Role must be either 'admin' or 'teacher'",
    });
  }

  // Only Gmail or Yahoo addresses are accepted
  const allowedEmailPattern = /^[^\s@]+@(gmail|yahoo)\.com$/i;
  if (!email || !allowedEmailPattern.test(email)) {
    return res.status(400).json({
      message: "Email must be a @gmail.com or @yahoo.com address",
    });
  }

  // Strong password: 8+ chars, upper, lower, number, special character
  const strongPasswordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[^\s]{8,}$/;
  if (!password || !strongPasswordPattern.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character",
    });
  }

  if (role === "admin") {
    const { school_name, school_code, phone, email, password } = req.body;

    if (!school_name || !school_code || !phone || !email || !password) {
      return res.status(400).json({
        message: "School name, school code, phone, email, and password are all required",
      });
    }

    // Check if school code or email is already taken
    db.get(
      `SELECT id FROM schools WHERE school_code = ? OR email = ?`,
      [school_code, email],
      (err, existing) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        if (existing) {
          return res.status(400).json({
            message: "A school with this code or email already exists",
          });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const createdAt = new Date().toISOString();

        db.run(
          `INSERT INTO schools (school_name, school_code, address, phone, email, password, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [school_name, school_code, req.body.address || "", phone, email, hashedPassword, createdAt],
          function (err) {
            if (err) {
              return res.status(500).json({ message: err.message });
            }

            res.json({
              message: "School registered successfully 🎉 You can now log in as Admin.",
            });
          }
        );
      }
    );
  } else {
    // role === "teacher"
    const { school_code, name, phone, email, password } = req.body;

    if (!school_code || !name || !phone || !email || !password) {
      return res.status(400).json({
        message: "School code, name, phone, email, and password are all required",
      });
    }

    // Find the school this teacher wants to join
    db.get(
      `SELECT id FROM schools WHERE school_code = ?`,
      [school_code],
      (err, school) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        if (!school) {
          return res.status(404).json({
            message: "No school found with this school code. Please check with your admin.",
          });
        }

        // Check if email is already used by another teacher
        db.get(
          `SELECT id FROM teachers WHERE email = ?`,
          [email],
          (err, existingTeacher) => {
            if (err) {
              return res.status(500).json({ message: err.message });
            }

            if (existingTeacher) {
              return res.status(400).json({
                message: "A teacher account with this email already exists",
              });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const createdAt = new Date().toISOString();

            db.run(
              `INSERT INTO teachers (school_id, name, phone, email, password, is_approved, created_at)
               VALUES (?, ?, ?, ?, ?, 0, ?)`,
              [school.id, name, phone, email, hashedPassword, createdAt],
              function (err) {
                if (err) {
                  return res.status(500).json({ message: err.message });
                }

                res.json({
                  message: "Registration successful ✅ Please wait for your admin to approve your account before logging in.",
                });
              }
            );
          }
        );
      }
    );
  }
});

// LOGIN — checks both Schools (admin) and Teachers tables
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // First, check if this email belongs to a school (admin)
  db.get(
    `SELECT * FROM schools WHERE email = ?`,
    [email],
    (err, school) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      if (school) {
        const isMatch = bcrypt.compareSync(password, school.password);

        if (!isMatch) {
          return res.status(400).json({ message: "Invalid password" });
        }

        if (school.is_active === 0) {
          return res.status(403).json({
            message: "This admin account has been deactivated.",
          });
        }

        const token = jwt.sign(
          {
            email: school.email,
            role: "admin",
            school_id: school.id,
            school_name: school.school_name,
          },
          SECRET_KEY,
          { expiresIn: "8h" }
        );

        return res.json({
          message: "Login successful 🚀",
          token,
          role: "admin",
          school_name: school.school_name,
        });
      }

      // Not a school — check the teachers table instead
      db.get(
        `SELECT * FROM teachers WHERE email = ?`,
        [email],
        (err, teacher) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }

          if (!teacher) {
            return res.status(400).json({ message: "Invalid email" });
          }

          const isMatch = bcrypt.compareSync(password, teacher.password);

          if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
          }

          if (teacher.is_approved !== 1) {
            return res.status(403).json({
              message: "Your account is pending admin approval. Please wait for your admin to approve you.",
            });
          }

          const token = jwt.sign(
            {
              email: teacher.email,
              role: "teacher",
              school_id: teacher.school_id,
              teacherId: teacher.id,
              name: teacher.name,
            },
            SECRET_KEY,
            { expiresIn: "8h" }
          );

          res.json({
            message: "Login successful 🚀",
            token,
            role: "teacher",
            name: teacher.name,
          });
        }
      );
    }
  );
});

// GET the logged-in user's own profile.
// Admin -> their school's details. Teacher -> their own details + school name.
router.get("/profile", verifyToken, (req, res) => {
  if (req.user.role === "admin") {
    db.get(
      `SELECT school_name, school_code, address, phone, email, created_at
       FROM schools WHERE id = ?`,
      [req.user.school_id],
      (err, school) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        if (!school) {
          return res.status(404).json({ message: "School not found" });
        }

        res.json({ role: "admin", ...school });
      }
    );
  } else {
    db.get(
      `SELECT teachers.name, teachers.email, teachers.phone, teachers.photo_path, teachers.created_at,
              schools.school_name, schools.school_code, schools.address
       FROM teachers
       LEFT JOIN schools ON teachers.school_id = schools.id
       WHERE teachers.id = ?`,
      [req.user.teacherId],
      (err, teacher) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        if (!teacher) {
          return res.status(404).json({ message: "Teacher not found" });
        }

        res.json({ role: "teacher", ...teacher });
      }
    );
  }
});

// Admin deactivates their own login. The school row and all its data
// (students, teachers, attendance, marks, everything) stays fully intact -
// this only blocks that admin's own future logins.
router.put("/deactivate", verifyToken, verifyAdmin, (req, res) => {
  db.run(
    `UPDATE schools SET is_active = 0 WHERE id = ?`,
    [req.user.school_id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      res.json({ message: "Your admin login has been deactivated." });
    }
  );
});

module.exports = router;