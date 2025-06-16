import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../axios";
import TaskList from "../components/TaskList";
import { toast } from "react-toastify";

function ProjectDetail() {
  const { id } = useParams(); // projectId from URL
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  // ✅ Fetch project details
  const fetchProject = async () => {
    try {
      const res = await axios.get(`/projects/${id}`, {
        headers: { Authorization: token },
      });
      setProject(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch project:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch users (corrected endpoint)
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users", {
        headers: { Authorization: token },
      });
      console.log("✅ Users fetched:", res.data);
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err.response?.data || err.message);
      toast.error("Failed to fetch users");
    }
  };

  // ✅ Add member to project
  const handleAddMember = async () => {
    if (!selectedUser) return toast.error("Please select a user");

    try {
      await axios.post(
        `/projects/${id}/members`,
        { userId: selectedUser },
        { headers: { Authorization: token } }
      );
      toast.success("✅ Member added");
      setSelectedUser("");
      fetchProject(); // Refresh members list
    } catch (err) {
      console.error("❌ Failed to add member:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  useEffect(() => {
    fetchProject();
    fetchUsers();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!project) return <p className="p-6 text-red-600">❌ Project not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
      <p className="mb-4 text-gray-600">{project.description}</p>

      {/* 📋 Task List */}
      <TaskList projectId={project._id} />

      {/* 👥 Project Members */}
      <div className="mt-8 bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-2">👥 Project Members</h2>

        <ul className="mb-4 list-disc pl-5 text-gray-700">
          {project.members?.length > 0 ? (
            project.members.map((member, i) => (
              <li key={i}>
                {member.name} ({member.email})
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No members yet.</p>
          )}
        </ul>

        <div className="flex gap-2 items-center">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
          <button
            onClick={handleAddMember}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Add Member
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
