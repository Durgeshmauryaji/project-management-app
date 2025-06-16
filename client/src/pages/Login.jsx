import React, { useState, useCallback } from "react";
import axios from "../axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // ✅ useCallback to optimize input handling
  const handleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  // ✅ Login submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/login", formData);
      const { token, user } = res.data;

      // ✅ Save token & user
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("✅ Login successful!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg === "Invalid email or password") {
        toast.error("User not found. Please register first.");
        navigate("/"); // Go to register
      } else {
        toast.error(msg || "❌ Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-4 py-2 border mb-4 rounded"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-4 py-2 border mb-4 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
