const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "school.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log("❌ Database connection error:", err.message);
    } else {
        console.log("✅ Connected to SQLite database at:", dbPath);
    }
});

// Schools table (this IS the principal/admin account for that school)
db.run(`
CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name TEXT,
    school_code TEXT UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    password TEXT,
    created_at TEXT
)
`);

// Teachers table - self-registered using a school code, tied to one school
// is_approved: 0 = pending admin approval, 1 = approved and can log in
db.run(`
CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    name TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    password TEXT,
    is_approved INTEGER DEFAULT 0,
    created_at TEXT
)
`);

// Students table
db.run(`
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    name TEXT,
    class TEXT,
    roll_no INTEGER,
    father_name TEXT,
    mother_name TEXT,
    apaar_id TEXT,
    pen_number TEXT,
    ifsc TEXT,
    account_number TEXT
)
`);

// Safe migrations - add new columns if they don't already exist.
// "duplicate column" errors are expected and ignored on every restart
// after the first time these columns are added.
const studentColumnMigrations = [
    "ALTER TABLE students ADD COLUMN srn_number TEXT",
    "ALTER TABLE students ADD COLUMN photo_path TEXT",
    "ALTER TABLE students ADD COLUMN aadhaar_path TEXT",
    "ALTER TABLE students ADD COLUMN birth_certificate_path TEXT",
];

studentColumnMigrations.forEach((sql) => {
    db.run(sql, (err) => {
        if (err && !err.message.includes("duplicate column")) {
            console.log("Migration error:", err.message);
        }
    });
});

// Attendance table
db.run(`
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    student_id INTEGER,
    class TEXT,
    date TEXT,
    status TEXT
)
`);

// Marks table (subject-based)
db.run(`
CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    student_id INTEGER,
    exam TEXT,
    subject_name TEXT,
    marks_obtained INTEGER
)
`);

// Notices table
db.run(`
CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    title TEXT,
    message TEXT,
    created_at TEXT
)
`);

// Timetable slots table - one row per (class, day, period) assignment
db.run(`
CREATE TABLE IF NOT EXISTS timetable_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    class TEXT,
    day TEXT,
    period_number INTEGER,
    subject_name TEXT,
    teacher_id INTEGER
)
`);

// Subjects table
db.run(`
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    class TEXT,
    subject_name TEXT
)
`);

// Teacher attendance table (marked manually by admin)
db.run(`
CREATE TABLE IF NOT EXISTS teacher_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    teacher_id INTEGER,
    date TEXT,
    status TEXT
)
`);

// Teacher diary table - daily log of what a teacher taught
db.run(`
CREATE TABLE IF NOT EXISTS teacher_diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER,
    teacher_id INTEGER,
    class TEXT,
    subject_name TEXT,
    date TEXT,
    topic TEXT,
    created_at TEXT
)
`);

// Safe migration - add photo column to teachers if it doesn't already exist
db.run(`ALTER TABLE teachers ADD COLUMN photo_path TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
        console.log("Migration error:", err.message);
    }
});

// Safe migration - add attachment column to notices if it doesn't already exist
db.run(`ALTER TABLE notices ADD COLUMN attachment_path TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
        console.log("Migration error:", err.message);
    }
});

// Safe migration - add is_active column to schools if it doesn't already exist.
// 1 = admin can log in normally, 0 = admin deactivated their own login
// (school data stays intact either way)
db.run(`ALTER TABLE schools ADD COLUMN is_active INTEGER DEFAULT 1`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
        console.log("Migration error:", err.message);
    }
});

module.exports = db;