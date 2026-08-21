function LoginPage({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin,
  setAuthView,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-[400px]">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          School ERP Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => setAuthView("register")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;