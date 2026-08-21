// Diagnostic script — run this from your project root with:
//   node check-db.js
//
// It just reads your existing school.db and prints out what's really in it.
// It does NOT modify anything.

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database", "school.db");
console.log("Reading database at:", dbPath);
console.log("----------------------------------------");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log("❌ Could not open database:", err.message);
        process.exit(1);
    }
});

db.all("SELECT id, school_name, school_code, email FROM schools", [], (err, schools) => {
    if (err) {
        console.log("❌ Error reading schools table:", err.message);
    } else {
        console.log(`\n📚 SCHOOLS TABLE (${schools.length} row(s)):`);
        console.table(schools);
    }

    db.all(
        "SELECT id, school_id, name, email, is_approved, created_at FROM teachers",
        [],
        (err, teachers) => {
            if (err) {
                console.log("❌ Error reading teachers table:", err.message);
            } else {
                console.log(`\n👩‍🏫 TEACHERS TABLE (${teachers.length} row(s)):`);
                console.table(teachers);
            }

            db.close();
        }
    );
});