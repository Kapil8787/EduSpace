import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { profileEndpoints } from "../services/apis";
import { setUser } from "../slices/profileSlice";

const PendingApproval = () => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;

    const checkStatus = async () => {
      if (!token) {
        // User came from pending login state; keep showing waiting UI.
        return;
      }

      try {
        const response = await apiConnector("GET", profileEndpoints.GET_USER_DETAILS_API, null, {
          Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        const user = response.data.data;
        dispatch(setUser(user));

        if (user.accountType === "Instructor" && user.approved) {
          navigate("/dashboard/my-profile");
          return;
        }

        if (!user.active) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          dispatch(setUser(null));
          navigate("/signup");
          return;
        }
      } catch (err) {
        console.error("Pending check error:", err);

        // If the user is no longer found / rejected, force re-signup
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        dispatch(setUser(null));
        navigate("/signup");
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [token, dispatch, navigate]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-8 text-center shadow-2xl"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl opacity-40"></div>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex justify-center mb-4"
        >
          <div className="bg-yellow-400/20 p-4 rounded-full">
            <FaClock className="text-yellow-300 text-3xl" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold text-white">Approval Pending</h1>
        <p className="mt-4 text-richblack-100 leading-relaxed">
          Your <span className="text-yellow-300 font-semibold">Instructor account</span> is under review.
          <br />
          <span className="text-richblack-200">Our admin team will verify your details shortly.</span>
        </p>

        <div className="mt-6 flex justify-center">
          <span className="px-4 py-1 text-sm rounded-full bg-yellow-400/20 text-yellow-300 animate-pulse">⏳ Waiting for Approval</span>
        </div>

        <p className="mt-4 text-sm text-richblack-300">You’ll receive an email once your account is approved.</p>
      </motion.div>
    </div>
  );
};

export default PendingApproval;