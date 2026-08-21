import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import JsBarcode from "jsbarcode";

function StudentPage({
  students,
  editStudent,
  deleteStudent,
  setPage,
  selectedStudent,
  setSelectedStudent,
  schoolName,
  userRole,
}) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [generatingId, setGeneratingId] = useState(false);

  const fileUrl = (relativePath) =>
    relativePath ? `http://localhost:3000${relativePath}` : null;

  const filteredStudents = students
    .filter((stu) =>
      (stu.name || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter((stu) =>
      classFilter ? stu.class === classFilter : true
    )
    .sort((a, b) => Number(a.roll_no) - Number(b.roll_no));

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Students Report", 14, 15);

    autoTable(doc, {
      head: [["ID", "Name", "Class", "Roll No"]],
      body: filteredStudents.map((stu) => [
        stu.id,
        stu.name,
        stu.class,
        stu.roll_no,
      ]),
    });

    doc.save("students-report.pdf");
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStudents);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students-report.xlsx");
  };

  // Fetches an image URL and converts it to a base64 data URL so jsPDF can embed it
  const urlToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  };

  const getSchoolTitleFontSize = (name) => {
    const length = name ? name.length : 0;
    if (length <= 12) return 12.5;
    if (length <= 20) return 10.5;
    if (length <= 30) return 8.5;
    return 7;
  };

  // Renders a real, scannable CODE128 barcode to a data URL for embedding in the PDF
  const generateBarcodeDataUrl = (value) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      height: 40,
      width: 2,
    });
    return canvas.toDataURL("image/png");
  };

  // Draws one ID card at (offsetX, offsetY) on whatever page of `doc` is
  // currently active. Shared by both the single-student and bulk generators.
  const drawIdCardOnDoc = async (doc, student, offsetX = 0, offsetY = 0) => {
    const W = 85.6;
    const H = 54;
    const ox = offsetX;
    const oy = offsetY;

    // Cream background
    doc.setFillColor(253, 246, 240);
    doc.rect(ox, oy, W, H, "F");

    // --- Decorative color blocks behind the photo (top-right corner) ---
    doc.setFillColor(220, 70, 55); // red
    doc.roundedRect(ox + W - 26, oy - 6, 20, 20, 3, 3, "F");
    doc.setFillColor(243, 166, 35); // orange/yellow
    doc.roundedRect(ox + W - 14, oy + 8, 14, 14, 3, 3, "F");
    doc.setFillColor(243, 166, 35);
    doc.roundedRect(ox + W - 30, oy + 32, 10, 10, 3, 3, "F");
    doc.setFillColor(40, 80, 190); // blue
    doc.roundedRect(ox + W - 12, oy + 34, 12, 12, 3, 3, "F");

    // Photo circle
    const photoCx = ox + W - 19;
    const photoCy = oy + 22;
    const photoR = 13.5;

    doc.setFillColor(253, 246, 240);
    doc.circle(photoCx, photoCy, photoR + 2, "F");

    if (student.photo_path) {
      try {
        const imgData = await urlToBase64(fileUrl(student.photo_path));
        const format = imgData
          .substring(imgData.indexOf("/") + 1, imgData.indexOf(";"))
          .toUpperCase();

        doc.saveGraphicsState();
        doc.circle(photoCx, photoCy, photoR, null);
        doc.clip();
        doc.discardPath();
        doc.addImage(
          imgData,
          format,
          photoCx - photoR,
          photoCy - photoR,
          photoR * 2,
          photoR * 2
        );
        doc.restoreGraphicsState();
      } catch (err) {
        console.log("Could not load student photo for ID card:", err);
        doc.setFillColor(225, 225, 225);
        doc.circle(photoCx, photoCy, photoR, "F");
      }
    } else {
      doc.setFillColor(225, 225, 225);
      doc.circle(photoCx, photoCy, photoR, "F");
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(6);
      doc.text("No Photo", photoCx, photoCy + 1, { align: "center" });
    }

    // --- Small label line (with icon) ---
    doc.setFillColor(40, 80, 190);
    doc.roundedRect(ox + 4, oy + 4, 3, 3, 0.8, 0.8, "F");
    doc.setTextColor(90, 90, 100);
    doc.setFont(undefined, "bold");
    doc.setFontSize(6);
    doc.text("STUDENT ID CARD", ox + 9, oy + 6.6);

    // --- Big title: the school's name ---
    doc.setTextColor(26, 26, 60);
    doc.setFont(undefined, "bold");
    const titleSize = getSchoolTitleFontSize(schoolName);
    doc.setFontSize(titleSize);

    const titleLines = doc.splitTextToSize(schoolName || "School ERP", 50);
    let ty = oy + 15;
    titleLines.slice(0, 2).forEach((line) => {
      doc.text(line, ox + 4, ty);
      ty += titleSize * 0.42;
    });

    // --- Field list ---
    doc.setFont(undefined, "normal");
    doc.setFontSize(6.3);
    doc.setTextColor(40, 40, 40);

    const fields = [
      ["Name", student.name || "-"],
      ["Class", student.class || "-"],
      ["Roll No", String(student.roll_no || "-")],
      ["Father", student.father_name || "-"],
    ];

    let fy = Math.max(ty + 2, oy + 30);
    fields.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      doc.text(label, ox + 4, fy);
      doc.setFont(undefined, "normal");
      doc.text(`: ${value}`, ox + 18, fy);
      fy += 3.6;
    });

    // --- Real scannable barcode: STU-{id} ---
    const barcodeValue = `STU-${student.id}`;
    try {
      const barcodeData = generateBarcodeDataUrl(barcodeValue);
      doc.addImage(barcodeData, "PNG", ox + 4, oy + H - 10.5, 46, 5.5);
      doc.setFontSize(4.5);
      doc.setTextColor(60, 60, 60);
      doc.text(barcodeValue, ox + 4, oy + H - 4.3);
    } catch (err) {
      console.log("Could not generate barcode:", err);
    }

    // --- Bottom accent bar ---
    doc.setFillColor(210, 90, 60);
    doc.rect(ox, oy + H - 1.6, W, 1.6, "F");

    // --- Cut-line border (helps when cutting cards apart from an A4 sheet) ---
    doc.setDrawColor(190, 190, 190);
    doc.setLineWidth(0.15);
    doc.rect(ox, oy, W, H, "S");
  };

  const generateIdCard = async (student) => {
    setGeneratingId(true);

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54],
      });

      await drawIdCardOnDoc(doc, student);

      doc.save(`${(student.name || "student").replace(/\s+/g, "_")}_ID_Card.pdf`);
    } catch (error) {
      console.log(error);
      alert("Failed to generate ID card ❌");
    } finally {
      setGeneratingId(false);
    }
  };

  const generateAllIdCards = async () => {
    if (filteredStudents.length === 0) {
      alert("No students to generate cards for. Try adjusting your search or class filter.");
      return;
    }

    setGeneratingId(true);

    try {
      // A4 portrait page, 2x2 grid = 4 cards per sheet
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const cardW = 85.6;
      const cardH = 54;
      const leftMargin = 12;
      const topMargin = 15;
      const colGap = 10;
      const rowGap = 10;

      const positions = [
        { x: leftMargin, y: topMargin },
        { x: leftMargin + cardW + colGap, y: topMargin },
        { x: leftMargin, y: topMargin + cardH + rowGap },
        { x: leftMargin + cardW + colGap, y: topMargin + cardH + rowGap },
      ];

      for (let i = 0; i < filteredStudents.length; i++) {
        const slot = i % 4;

        if (i > 0 && slot === 0) {
          doc.addPage("a4", "portrait");
        }

        await drawIdCardOnDoc(
          doc,
          filteredStudents[i],
          positions[slot].x,
          positions[slot].y
        );
      }

      const suffix = classFilter ? `Class_${classFilter}` : "All_Students";
      doc.save(`ID_Cards_A4_${suffix}.pdf`);
    } catch (error) {
      console.log(error);
      alert("Failed to generate ID cards ❌");
    } finally {
      setGeneratingId(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-100 min-h-full">
      <div className="bg-white shadow-xl rounded-2xl p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">All Students</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded-lg flex-1"
          />

          <input
            type="text"
            placeholder="Filter by class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="border p-3 rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={exportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Export PDF
          </button>

          <button
            onClick={exportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Export Excel
          </button>

          {userRole === "teacher" && (
            <button
              onClick={generateAllIdCards}
              disabled={generatingId}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {generatingId ? "Generating..." : "🪪 Generate All ID Cards"}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border min-w-[600px]">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((stu) => (
                <tr
                  key={stu.id}
                  className="border-b text-center hover:bg-blue-50 cursor-pointer"
                  onClick={() => setSelectedStudent(stu)}
                >
                  <td className="p-3">{stu.id}</td>
                  <td className="p-3">{stu.name}</td>
                  <td className="p-3">{stu.class}</td>
                  <td className="p-3">{stu.roll_no}</td>
                  <td className="p-3 space-x-2 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editStudent(stu);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStudent(stu.id);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[500px] max-h-[85vh] overflow-y-auto shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Student Profile</h2>

              {selectedStudent.photo_path && (
                <img
                  src={fileUrl(selectedStudent.photo_path)}
                  alt="Student"
                  className="w-24 h-24 rounded-full object-cover mb-4 border"
                />
              )}

              <div className="space-y-2">
                <p><b>Name:</b> {selectedStudent.name}</p>
                <p><b>Class:</b> {selectedStudent.class}</p>
                <p><b>Roll No:</b> {selectedStudent.roll_no}</p>
                <p><b>SRN Number:</b> {selectedStudent.srn_number || "-"}</p>
                <p><b>Father Name:</b> {selectedStudent.father_name}</p>
                <p><b>Mother Name:</b> {selectedStudent.mother_name}</p>
                <p><b>APAAR ID:</b> {selectedStudent.apaar_id}</p>
                <p><b>PEN Number:</b> {selectedStudent.pen_number}</p>
                <p><b>IFSC:</b> {selectedStudent.ifsc}</p>
                <p><b>Account Number:</b> {selectedStudent.account_number}</p>

                <div className="pt-2 space-x-4">
                  {selectedStudent.aadhaar_path && (
                    <a
                      href={fileUrl(selectedStudent.aadhaar_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 underline text-sm"
                    >
                      View Aadhaar Card
                    </a>
                  )}

                  {selectedStudent.birth_certificate_path && (
                    <a
                      href={fileUrl(selectedStudent.birth_certificate_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 underline text-sm"
                    >
                      View Birth Certificate
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {userRole === "teacher" && (
                  <button
                    onClick={() => generateIdCard(selectedStudent)}
                    disabled={generatingId}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {generatingId ? "Generating..." : "🪪 Generate ID Card"}
                  </button>
                )}

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="bg-red-500 text-white px-5 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setPage("dashboard")}
          className="mt-6 bg-gray-500 text-white px-6 py-3 rounded-lg"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default StudentPage;