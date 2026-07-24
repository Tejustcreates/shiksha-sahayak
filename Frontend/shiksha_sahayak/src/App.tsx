import React, { useState, useEffect } from 'react';

function App() {
  // Use state to store the message
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        setMessage(data.message); // update state
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Shiksha Sahayak</h1>
      </nav>

      {/* Display message */}
      <div className="p-4">
        <pre className="bg-gray-200 p-4 rounded-lg overflow-x-auto">
          Dhaval: {message}
        </pre>
      </div>
      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Smart Classroom Attendance 🚀
          </h2>

          <p className="text-gray-600 mb-6">
            Where Teaching Meets Technology
          </p>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;
