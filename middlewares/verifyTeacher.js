function verifyTeacher(req, res, next) {
    if (req.user.role !== "teacher") {
        return res.status(403).json({
            message: "Access denied. Teachers only."
        });
    }

    next();
}

module.exports = verifyTeacher;