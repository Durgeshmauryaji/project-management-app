import axios from "axios";

// ✅ Base URL logic
const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://project-management-app-4-gs2v.onrender.com/api"; // ✅ Production URL

// ✅ Axios instance
const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // 🔐 only needed if using cookies/sessions
});

export default instance;
