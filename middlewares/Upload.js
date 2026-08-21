const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Make sure the uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

const allowedTypesByField = {
    photo: [".jpg", ".jpeg", ".png"],
    aadhaar: [".jpg", ".jpeg", ".pdf"],
    birth_certificate: [".jpg", ".jpeg", ".png", ".pdf"],
    attachment: [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"],
};

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = allowedTypesByField[file.fieldname] || [];

    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Invalid file type for ${file.fieldname}. Allowed: ${allowed.join(", ")}`
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

// Ready-to-use middleware for the 3 student document fields.
// Wrapped so upload errors (wrong file type, too large) come back
// as clean JSON instead of crashing or returning an HTML error page.
const uploadStudentDocs = (req, res, next) => {
    const handler = upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "aadhaar", maxCount: 1 },
        { name: "birth_certificate", maxCount: 1 },
    ]);

    handler(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// Ready-to-use middleware for a teacher uploading their own profile photo
const uploadTeacherPhoto = (req, res, next) => {
    const handler = upload.single("photo");

    handler(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// Ready-to-use middleware for an optional file attached to a notice
const uploadNoticeAttachment = (req, res, next) => {
    const handler = upload.single("attachment");

    handler(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

module.exports = { uploadStudentDocs, uploadTeacherPhoto, uploadNoticeAttachment };