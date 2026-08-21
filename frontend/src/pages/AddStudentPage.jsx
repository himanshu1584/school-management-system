function AddStudentPage({
  student,
  handleStudentChange,
  handleSaveStudent,
  handleFileChange,
  fileInputResetKey,
  editingStudentId,
  setPage,
}) {
  const fileUrl = (relativePath) =>
    relativePath ? `http://localhost:3000${relativePath}` : null;

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-100 min-h-full">
      <div className="bg-white shadow-2xl rounded-3xl p-5 md:p-10 max-w-5xl mx-auto border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          {editingStudentId ? "Update Student" : "Add Student"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            name="name"
            placeholder="Student Name"
            value={student.name}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="class"
            placeholder="Class"
            value={student.class}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="roll_no"
            placeholder="Roll No"
            value={student.roll_no}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="srn_number"
            placeholder="SRN Number"
            value={student.srn_number}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="father_name"
            placeholder="Father Name"
            value={student.father_name}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="mother_name"
            placeholder="Mother Name"
            value={student.mother_name}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="apaar_id"
            placeholder="APAAR ID"
            value={student.apaar_id}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="pen_number"
            placeholder="PEN Number"
            value={student.pen_number}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="ifsc"
            placeholder="IFSC"
            value={student.ifsc}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="account_number"
            placeholder="Account Number"
            value={student.account_number}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
          />
        </div>

        {/* Documents */}
        <h2 className="text-xl md:text-2xl font-bold mt-10 mb-5 text-gray-800">
          Documents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Student Photo
            </label>
            <input
              key={`photo-${fileInputResetKey}`}
              type="file"
              name="photo"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG - max 5MB</p>

            {editingStudentId && student.photo_path && (
              <a
                href={fileUrl(student.photo_path)}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 text-sm underline mt-1 inline-block"
              >
                View current photo
              </a>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Aadhaar Card
            </label>
            <input
              key={`aadhaar-${fileInputResetKey}`}
              type="file"
              name="aadhaar"
              accept=".jpg,.jpeg,.pdf"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">JPG, JPEG, PDF - max 5MB</p>

            {editingStudentId && student.aadhaar_path && (
              <a
                href={fileUrl(student.aadhaar_path)}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 text-sm underline mt-1 inline-block"
              >
                View current Aadhaar card
              </a>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Birth Certificate
            </label>
            <input
              key={`birth_certificate-${fileInputResetKey}`}
              type="file"
              name="birth_certificate"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 shadow-sm text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG, PDF - max 5MB</p>

            {editingStudentId && student.birth_certificate_path && (
              <a
                href={fileUrl(student.birth_certificate_path)}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 text-sm underline mt-1 inline-block"
              >
                View current birth certificate
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            onClick={handleSaveStudent}
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            {editingStudentId ? "Update Student" : "Save Student"}
          </button>

          <button
            onClick={() => setPage("dashboard")}
            className="bg-gray-600 text-white px-8 py-4 rounded-2xl shadow hover:bg-gray-700 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddStudentPage;