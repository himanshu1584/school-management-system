import { useState, useEffect } from "react";
import axios from "axios";

function TeacherProfilePage({ setPage, setLoggedIn }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your teacher account? This cannot be undone - you will need to sign up again and be re-approved by your admin if you want to come back."
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const token = localStorage.getItem("token");

      await axios.delete("http://localhost:3000/teachers/me", {
        headers: { Authorization: token },
      });

      alert("Your account has been deleted.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setLoggedIn(false);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Failed to delete account ❌");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-100 p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-10 max-w-2xl mx-auto border border-gray-100">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-gray-800">
          My Profile
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : !profile ? (
          <p className="text-gray-500">Could not load profile details.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-3">
              <span className="font-semibold text-gray-600">Name</span>
              <span className="text-gray-800 sm:text-right break-words">{profile.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-3">
              <span className="font-semibold text-gray-600">School</span>
              <span className="text-gray-800 sm:text-right break-words">{profile.school_name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-3">
              <span className="font-semibold text-gray-600">School Code</span>
              <span className="text-gray-800 sm:text-right break-words">{profile.school_code || "-"}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b pb-3">
              <span className="font-semibold text-gray-600">School Address</span>
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
              <span className="font-semibold text-gray-600">Joined On</span>
              <span className="text-gray-800 sm:text-right break-words">{formatDate(profile.created_at)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-10">
          <button
            onClick={() => setPage("dashboard")}
            className="bg-gray-600 text-white px-8 py-4 rounded-2xl shadow hover:bg-gray-700 transition"
          >
            Back
          </button>

          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="bg-red-600 text-white px-8 py-4 rounded-2xl shadow hover:bg-red-700 transition disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherProfilePage;