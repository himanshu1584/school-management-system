import { useState, useEffect } from "react";
import axios from "axios";

function AdminProfilePage({ setPage }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:3000/auth/profile",
        {
          headers: { Authorization: token },
        }
      );

      setProfile(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load profile ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-full bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-10 max-w-2xl mx-auto border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          School Profile
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : !profile ? (
          <p className="text-gray-500">Could not load profile details.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-3">
              <span className="font-semibold text-gray-600">School Name</span>
              <span className="text-gray-800 sm:text-right break-words">{profile.school_name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-3">
              <span className="font-semibold text-gray-600">School Code</span>
              <span className="text-gray-800 sm:text-right break-words">{profile.school_code}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-3">
              <span className="font-semibold text-gray-600">Address</span>
              <span className="text-gray-800 sm:text-right break-words">{profile.address || "-"}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-3">
              <span className="font-semibold text-gray-600">Phone</span>
              <span className="text-gray-800 sm:text-right break-words">{profile.phone}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-3">
              <span className="font-semibold text-gray-600">Email</span>
              <span className="text-gray-800 sm:text-right break-words">{profile.email}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="font-semibold text-gray-600">Registered On</span>
              <span className="text-gray-800 sm:text-right break-words">{formatDate(profile.created_at)}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setPage("dashboard")}
          className="mt-10 bg-gray-600 text-white px-8 py-4 rounded-2xl shadow hover:bg-gray-700 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default AdminProfilePage;