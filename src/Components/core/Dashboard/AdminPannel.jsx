import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createCategory } from "../../../services/operations/courseDetailsAPI";
import {
  getPendingInstructors,
  approveInstructor,
  rejectInstructor,
} from "../../../services/operations/profileAPI";

const AdminPannel = () => {
  const { token } = useSelector((state) => state.auth);
  const [category, setCategory] = useState({ name: "", description: "" });
  const [pending, setPending] = useState([]);

  const loadPendingInstructors = async () => {
    if (!token) return;
    const instructors = await getPendingInstructors(token);
    setPending(instructors || []);
  };

  useEffect(() => {
    loadPendingInstructors();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category.name || !category.description) {
      return;
    }
    await createCategory(
      {
        name: category.name,
        description: category.description,
      },
      token,
    );
    setCategory({ name: "", description: "" });
  };

  const handleApprove = async (id) => {
    const result = await approveInstructor(token, id);
    if (result) {
      loadPendingInstructors();
    }
  };

  const handleReject = async (id) => {
    const result = await rejectInstructor(
      token,
      id,
      "Not eligible at this time",
    );
    if (result) {
      loadPendingInstructors();
    }
  };

  return (
    <div className="p-5 text-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create Category</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-xl">
          <input
            value={category.name}
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
            type="text"
            placeholder="Category name"
            className="rounded-md border border-gray-700 bg-richblack-800 p-2"
          />
          <textarea
            value={category.description}
            onChange={(e) =>
              setCategory({ ...category, description: e.target.value })
            }
            placeholder="Category description"
            className="rounded-md border border-gray-700 bg-richblack-800 p-2"
          />
          <button
            type="submit"
            className="w-32 rounded-md bg-yellow-50 px-6 py-2 font-bold text-black"
          >
            Create
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Pending Instructors</h2>
        {pending.length > 0 ? (
          <div className="grid gap-4">
            {pending.map((instructor) => (
              <div
                key={instructor._id}
                className="rounded-xl border border-richblack-700 bg-gradient-to-br from-richblack-800 to-richblack-900 p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {instructor.firstName} {instructor.lastName}
                    </h3>
                    <p className="text-sm text-richblack-300">
                      {instructor.email}
                    </p>
                  </div>

                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-400/20 text-yellow-300 animate-pulse">
                    Pending
                  </span>
                </div>

                {/* Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-richblack-400 text-xs uppercase tracking-wide">
                      Institute
                    </p>
                    <p className="text-white font-medium">
                      {instructor.additionalDetails?.instituteName || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-richblack-400 text-xs uppercase tracking-wide">
                      Experience
                    </p>
                    <p className="text-white font-medium">
                      {instructor.additionalDetails?.experience || 0} years
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-richblack-400 text-xs uppercase tracking-wide">
                      LinkedIn
                    </p>
                    <a
                      href={instructor.additionalDetails?.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline break-all"
                    >
                      {instructor.additionalDetails?.linkedin || "Not Provided"}
                    </a>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-4">
                  {/* Approve Button */}
                  <button
                    onClick={() => handleApprove(instructor._id)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-emerald-400 to-green-500 py-2 font-semibold text-white shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200"
                  >
                    ✅ Approve
                  </button>

                  {/* Reject Button */}
                  <button
                    onClick={() => handleReject(instructor._id)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 py-2 font-semibold text-white shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-richblack-300">No pending instructors</p>
        )}
      </div>
    </div>
  );
};

export default AdminPannel;
