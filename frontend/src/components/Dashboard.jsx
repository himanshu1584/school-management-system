function Dashboard({ students }) {
  return (
    <div className="flex-1 p-8 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow p-6 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
        <span className="text-gray-500">Teacher Portal</span>
      </div>

      <h1 className="text-4xl font-bold mb-2">School Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome Teacher 👋</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500">Students</h2>
          <p className="text-3xl font-bold">{students.length}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500">Attendance</h2>
          <p className="text-3xl font-bold">Active</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-500">Reports</h2>
          <p className="text-3xl font-bold">Ready</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;