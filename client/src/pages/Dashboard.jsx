import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../axios";
import TaskList from "../components/TaskList";

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const token = localStorage.getItem("authToken");

  // ✅ fetchProjects wrapped in useCallback to avoid useEffect warnings
  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get("/projects", {
        headers: {
          Authorization: token,
        },
      });
      setProjects(res.data);
    } catch (err) {
      toast.error("Failed to load projects");
    }
  }, [token]);

  // ✅ Protect route + fetch projects
  useEffect(() => {
    if (!token) {
      toast.error("Please login first.");
      navigate("/login");
    } else {
      fetchProjects();
    }
  }, [navigate, token, fetchProjects]);

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/projects", formData, {
        headers: {
          Authorization: token,
        },
      });
      toast.success("Project created");
      setFormData({ name: "", description: "" });
      setProjects([res.data, ...projects]);
      navigate(`/project/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating project");
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🗂️ Project Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* ➕ Create Project Form */}
      <div className="flex items-center justify-center w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md mb-6 w-1/2 flex flex-col items-center justify-center mx-auto"
        >
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2 border mb-4 rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Project Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-2 border mb-4 rounded"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Project
          </button>
        </form>
      </div>

      {/* 📋 Project List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 ? (
          <p>No projects found. Create your first one!</p>
        ) : (
          projects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-4 rounded shadow"
            >
              <h3
                className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                {project.name}
              </h3>
              <p className="text-gray-600">{project.description}</p>
              <p className="text-sm text-gray-400 mt-2">
                Created on:{" "}
                {new Date(project.createdAt).toLocaleString()}
              </p>

              {/* ✅ Task List Below Project */}
              <TaskList projectId={project._id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
