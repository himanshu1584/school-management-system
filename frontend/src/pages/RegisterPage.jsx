import { useState } from "react";
import axios from "axios";

const EMAIL_PATTERN = /^[^\s@]+@(gmail|yahoo)\.com$/i;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[^\s]{8,}$/;

function RegisterPage({ setAuthView }) {
  const [role, setRole] = useState("admin");

  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [address, setAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const resetForm = () => {
    setSchoolName("");
    setSchoolCode("");
    setAddress("");
    setFullName("");
    setPhone("");
    setEmail("");
    setPassword("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!EMAIL_PATTERN.test(email)) {
      alert("Email must be a @gmail.com or @yahoo.com address");
      return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
      alert(
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (e.g. ! @ # $)"
      );
      return;
    }

    try {
      let payload = { role, school_code: schoolCode, phone, email, password };

      if (role === "admin") {
        payload.school_name = schoolName;
        payload.address = address;
      } else {
        payload.name = fullName;
      }

      const response = await axios.post(
        "http://localhost:3000/auth/register",
        payload
      );

      alert(response.data.message);
      resetForm();
      setAuthView("login");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Registration failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-[450px] my-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Create Account
        </h1>

        {/* Role toggle */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-3 rounded-lg font-semibold transition text-sm sm:text-base ${
              role === "admin"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Admin / Principal
          </button>

          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`flex-1 py-3 rounded-lg font-semibold transition text-sm sm:text-base ${
              role === "teacher"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Teacher
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {role === "admin" && (
            <input
              type="text"
              placeholder="School Name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full border p-3 rounded-lg"
              required
            />
          )}

          {role === "admin" && (
            <input
              type="text"
              placeholder="School Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          )}

          {role === "teacher" && (
            <input
              type="text"
              placeholder="Your Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border p-3 rounded-lg"
              required
            />
          )}

          <input
            type="text"
            placeholder={
              role === "admin"
                ? "Choose a School Code (e.g. GHS2026)"
                : "Enter your School's Code"
            }
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />

          <div>
            <input
              type="email"
              placeholder="Email (@gmail.com or @yahoo.com only)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded-lg"
              required
            />
            <p className="text-xs text-gray-400 mt-1 px-1">
              Only Gmail or Yahoo email addresses are accepted.
            </p>
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg"
              required
            />
            <p className="text-xs text-gray-400 mt-1 px-1">
              At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {role === "admin" ? "Register School" : "Sign Up as Teacher"}
          </button>
        </form>

        {role === "teacher" && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Your admin will need to approve your account before you can log in.
          </p>
        )}

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => setAuthView("login")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;