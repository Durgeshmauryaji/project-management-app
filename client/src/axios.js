import axios from "axios";

const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api"
      : "https://project-management-app-4-gs2v.onrender.com/api", // ✅ yahi final backend URL hai
  withCredentials: false,
});

export default instance;
