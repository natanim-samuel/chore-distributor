import { useEffect, useState } from "react";
import {
  getChores,
  createChore,
  updateChore,
  deleteChore,
} from "../services/choreApi";
import "./Chores.css";

const initialForm = {
  title: "",
  description: "",
  difficulty: 2,
  priority: "MEDIUM",
  frequency: "ONCE",
  estimatedMinutes: "",
};

export default function Chores() {
  const [households, setHouseholds] = useState([]);
  const [selectedHousehold, setSelectedHousehold] = useState("");
  const [chores, setChores] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    loadHouseholds();
  }, []);

  async function loadHouseholds() {
    try {
      const response = await fetch(
        "http://localhost:4000/api/households",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load households."
        );
      }

      setHouseholds(data.data.households);

      if (data.data.households.length > 0) {
        setSelectedHousehold(data.data.households[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (selectedHousehold) {
      loadChores();
    }
  }, [selectedHousehold]);

  async function loadChores() {
    try {
      setLoading(true);
      setError("");

      const data = await getChores(selectedHousehold);

      setChores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const choreData = {
        ...form,
        difficulty: Number(form.difficulty),
        estimatedMinutes: form.estimatedMinutes
          ? Number(form.estimatedMinutes)
          : null,
      };

      if (editingId) {
        await updateChore(editingId, choreData);

        setMessage("Chore updated successfully!");
      } else {
        await createChore(
          selectedHousehold,
          choreData
        );

        setMessage("Chore created successfully!");
      }

      setForm(initialForm);
      setEditingId(null);

      await loadChores();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(chore) {
    setEditingId(chore.id);

    setForm({
      title: chore.title || "",
      description: chore.description || "",
      difficulty: chore.difficulty || 2,
      priority: chore.priority || "MEDIUM",
      frequency: chore.frequency || "ONCE",
      estimatedMinutes:
        chore.estimated_minutes || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(choreId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chore?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await deleteChore(choreId);

      setMessage("Chore deleted successfully!");

      await loadChores();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
  }

  return (
    <div className="chores-page">
      <div className="chores-header">
        <div>
          <button onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
         </button>  
            
          <h1>🧹 Chore Management</h1>
          <br></br>
          <p>Create and manage household chores.</p>
        </div>

        <select
          value={selectedHousehold}
          onChange={(event) =>
            setSelectedHousehold(event.target.value)
          }
        >
          {households.map((household) => (
            <option
              key={household.id}
              value={household.id}
            >
              {household.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      {message && (
        <div className="message success">
          {message}
        </div>
      )}

      {!selectedHousehold && (
        <div className="empty-state">
          <h2>No household found</h2>
          <p>
            Create or join a household before creating chores.
          </p>
        </div>
      )}

      {selectedHousehold && (
        <>
          <div className="chore-form-card">
            <h2>
              {editingId
                ? "✏️ Edit Chore"
                : "➕ Create New Chore"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Chore Title *</label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Example: Wash dishes"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty</label>

                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                  >
                    <option value="1">1 - Very Easy</option>
                    <option value="2">2 - Easy</option>
                    <option value="3">3 - Medium</option>
                    <option value="4">4 - Hard</option>
                    <option value="5">5 - Very Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Frequency</label>

                  <select
                    name="frequency"
                    value={form.frequency}
                    onChange={handleChange}
                  >
                    <option value="ONCE">One Time</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estimated Minutes</label>

                  <input
                    type="number"
                    name="estimatedMinutes"
                    value={form.estimatedMinutes}
                    onChange={handleChange}
                    min="1"
                    placeholder="Example: 20"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what needs to be done..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button"
                >
                  {editingId
                    ? "Update Chore"
                    : "Create Chore"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="secondary-button"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="chore-list-section">
            <h2>Your Chores ({chores.length})</h2>

            {loading && <p>Loading...</p>}

            {!loading && chores.length === 0 && (
              <div className="empty-state">
                <p>
                  No chores yet. Create your first chore! 🧹
                </p>
              </div>
            )}

            <div className="chore-grid">
              {chores.map((chore) => (
                <div
                  className="chore-card"
                  key={chore.id}
                >
                  <div className="chore-card-header">
                    <h3>{chore.title}</h3>

                    <span
                      className={`priority ${chore.priority.toLowerCase()}`}
                    >
                      {chore.priority}
                    </span>
                  </div>

                  {chore.description && (
                    <p className="description">
                      {chore.description}
                    </p>
                  )}

                  <div className="chore-details">
                    <span>
                      🔄 {chore.frequency}
                    </span>

                    <span>
                      ⭐ Difficulty: {chore.difficulty}/5
                    </span>

                    {chore.estimated_minutes && (
                      <span>
                        ⏱️ {chore.estimated_minutes} min
                      </span>
                    )}
                  </div>

                  <div className="chore-actions">
                    <button
                      onClick={() =>
                        handleEdit(chore)
                      }
                      className="edit-button"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(chore.id)
                      }
                      className="delete-button"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}