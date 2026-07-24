import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { API_URL } from '../config';

const RebuildMemoryButton = ({ classId }) => {
  const [isRebuilding, setIsRebuilding] = useState(false);

  const handleRebuild = async () => {
    if (!classId) {
      return alert("Please select a class from the dropdown first!");
    }
    
    if (!window.confirm("This will scan all student photos in this class and rebuild the AI memory. This might take a minute depending on class size. Continue?")) {
      return;
    }

    setIsRebuilding(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/attendance/rebuild-encodings/${classId}`, {
        method: "POST", 
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Success: ${data.message}\nSuccessfully Encoded: ${data.encoded_students} students.\nFailed/No Photo: ${data.failed_students} students.`);
      } else {
        alert(`❌ Error: ${data.error || "Failed to rebuild."}`);
      }
    } catch (error) {
      console.error("Rebuild error:", error);
      alert("Failed to connect to the server.");
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <button
      onClick={handleRebuild}
      disabled={isRebuilding || !classId}
      title="Force AI to relearn faces from the database"
      className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm w-full sm:w-auto mt-4 sm:mt-0 ${
        isRebuilding || !classId
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 hover:shadow-md'
      }`}
    >
      <Database size={18} className={isRebuilding ? "animate-pulse" : ""} />
      {isRebuilding ? "Rebuilding AI Memory..." : "Rebuild AI Memory"}
    </button>
  );
};

export default RebuildMemoryButton;