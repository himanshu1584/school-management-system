import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

function ManageTeachersPage({ setPage, schoolName }) {
  const [teachers, setTeachers] = useState([]);
  const [generatingId, setGeneratingId] = useState(false);

  const fileUrl = (relativePath) =>
    relativePath ? `http://localhost:3000${relativePath}` : null;

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3000/teachers", {
        headers: { Authorization: token },
      });

      setTeachers(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load teachers ❌");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const approveTeacher = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:3000/teachers/${id}/approve`,
        {},
        {
          headers: { Authorization: token },
        }
      );

      fetchTeachers();
    } catch (error) {
      console.log(error);
      alert("Failed to approve teacher ❌");
    }
  };

  const removeTeacher = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3000/teachers/${id}`, {
        headers: { Authorization: token },
      });

      fetchTeachers();
    } catch (error) {
      console.log(error);
      alert("Failed to remove teacher ❌");
    }
  };

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

  // Draws one Teacher ID card at (offsetX, offsetY). Same visual language as
  // the Student ID card, but with a teal accent instead of blue/red to make
  // Teacher cards visually distinct at a glance, and a TCH- prefixed barcode.
  const drawTeacherIdCardOnDoc = async (doc, teacher, offsetX = 0, offsetY = 0) => {
    const W = 85.6;
    const H = 54;
    const ox = offsetX;
    const oy = offsetY;

    // Cream background
    doc.setFillColor(240, 249, 248);
    doc.rect(ox, oy, W, H, "F");

    // --- Decorative color blocks (teal/green palette - distinct from student's red/orange/blue) ---
    doc.setFillColor(13, 148, 136); // teal
    doc.roundedRect(ox + W - 26, oy - 6, 20, 20, 3, 3, "F");
    doc.setFillColor(45, 212, 191); // light teal
    doc.roundedRect(ox + W - 14, oy + 8, 14, 14, 3, 3, "F");
    doc.setFillColor(250, 204, 21); // gold accent
    doc.roundedRect(ox + W - 30, oy + 32, 10, 10, 3, 3, "F");
    doc.setFillColor(15, 118, 110); // dark teal
    doc.roundedRect(ox + W - 12, oy + 34, 12, 12, 3, 3, "F");

    // Photo circle
    const photoCx = ox + W - 19;
    const photoCy = oy + 22;
    const photoR = 13.5;

    doc.setFillColor(240, 249, 248);
    doc.circle(photoCx, photoCy, photoR + 2, "F");

    if (teacher.photo_path) {
      try {
        const imgData = await urlToBase64(fileUrl(teacher.photo_path));
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
        console.log("Could not load teacher photo for ID card:", err);
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

    // --- Small label line (with icon) - teal, to distinguish from student's blue ---
    doc.setFillColor(13, 148, 136);
    doc.roundedRect(ox + 4, oy + 4, 3, 3, 0.8, 0.8, "F");
    doc.setTextColor(90, 90, 100);
    doc.setFont(undefined, "bold");
    doc.setFontSize(6);
    doc.text("TEACHER ID CARD", ox + 9, oy + 6.6);

    // --- Big title: the school's name ---
    doc.setTextColor(15, 60, 55);
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
      ["Name", teacher.name || "-"],
      ["Email", teacher.email || "-"],
      ["Phone", teacher.phone || "-"],
      ["Role", "Teaching Staff"],
    ];

    let fy = Math.max(ty + 2, oy + 30);
    fields.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      doc.text(label, ox + 4, fy);
      doc.setFont(undefined, "normal");
      doc.text(`: ${value}`, ox + 16, fy);
      fy += 3.6;
    });

    // --- Real scannable barcode: TCH-{id} ---
    const barcodeValue = `TCH-${teacher.id}`;
    try {
      const barcodeData = generateBarcodeDataUrl(barcodeValue);
      doc.addImage(barcodeData, "PNG", ox + 4, oy + H - 10.5, 46, 5.5);
      doc.setFontSize(4.5);
      doc.setTextColor(60, 60, 60);
      doc.text(barcodeValue, ox + 4, oy + H - 4.3);
    } catch (err) {
      console.log("Could not generate barcode:", err);
    }

    // --- Bottom accent bar (teal, distinct from student's orange) ---
    doc.setFillColor(13, 148, 136);
    doc.rect(ox, oy + H - 1.6, W, 1.6, "F");

    // --- Cut-line border ---
    doc.setDrawColor(190, 190, 190);
    doc.setLineWidth(0.15);
    doc.rect(ox, oy, W, H, "S");
  };

  const generateTeacherIdCard = async (teacher) => {
    setGeneratingId(true);

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54],
      });

      await drawTeacherIdCardOnDoc(doc, teacher);

      doc.save(`${(teacher.name || "teacher").replace(/\s+/g, "_")}_ID_Card.pdf`);
    } catch (error) {
      console.log(error);
      alert("Failed to generate ID card ❌");
    } finally {
      setGeneratingId(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-10 max-w-4xl mx-auto border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          Manage Teachers
        </h1>

        {teachers.length === 0 ? (
          <p className="text-gray-500">No teachers have signed up yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow-xl">
            <table className="w-full bg-white overflow-hidden min-w-[750px]">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((t) => (
                  <tr
                    key={t.id}
                    className="text-center border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{t.name}</td>
                    <td className="p-4">{t.phone}</td>
                    <td className="p-4">{t.email}</td>
                    <td className="p-4">
                      {t.is_approved === 1 ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Approved
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 space-x-2 whitespace-nowrap">
                      {t.is_approved !== 1 && (
                        <button
                          onClick={() => approveTeacher(t.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                      )}

                      {t.is_approved === 1 && (
                        <button
                          onClick={() => generateTeacherIdCard(t)}
                          disabled={generatingId}
                          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                        >
                          🪪 ID Card
                        </button>
                      )}

                      <button
                        onClick={() => removeTeacher(t.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => setPage("dashboard")}
          className="mt-8 bg-gray-600 text-white px-8 py-4 rounded-2xl shadow hover:bg-gray-700 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default ManageTeachersPage;