import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000/api";

function Assignments() {
  const navigate = useNavigate();

  const [households, setHouseholds] = useState([]);
  const [selectedHousehold, setSelectedHousehold] = useState("");

  const [chores, setChores] = useState([]);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    choreId: "",
    assignedTo: "",
    assignedDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (selectedHousehold) {
      loadHouseholdData(selectedHousehold);
    }
  }, [selectedHousehold]);

  function getToken() {
    return localStorage.getItem("accessToken");
  }

  function authHeaders() {
    return {
      Authorization: `Bearer ${getToken()}`,
    };
  }

  async function loadHouseholds() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/households`,
        {
          headers: authHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load households."
        );
      }

      const loadedHouseholds =
        result.data?.households || [];

      setHouseholds(loadedHouseholds);

      if (loadedHouseholds.length > 0) {
        setSelectedHousehold(
          loadedHouseholds[0].id
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadHouseholdData(householdId) {
    try {
      setAssignmentsLoading(true);
      setError("");
      setMessage("");

      await Promise.all([
        loadChores(householdId),
        loadMembers(householdId),
        loadAssignments(householdId),
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setAssignmentsLoading(false);
    }
  }

  async function loadChores(householdId) {
    const response = await fetch(
      `${API_URL}/households/${householdId}/chores`,
      {
        headers: authHeaders(),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load chores."
      );
    }

    setChores(result.data?.chores || []);
  }

  async function loadMembers(householdId) {
    const response = await fetch(
      `${API_URL}/households/${householdId}/members`,
      {
        headers: authHeaders(),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load members."
      );
    }

    setMembers(result.data?.members || []);
  }

  async function loadAssignments(householdId) {
    const response = await fetch(
      `${API_URL}/households/${householdId}/assignments`,
      {
        headers: authHeaders(),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load assignments."
      );
    }

    setAssignments(
      result.data?.assignments || []
    );
  }

  function handleHouseholdChange(event) {
    const householdId = event.target.value;

    setSelectedHousehold(householdId);

    setForm({
      choreId: "",
      assignedTo: "",
      assignedDate:
        new Date().toISOString().split("T")[0],
      dueDate: "",
      notes: "",
    });
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
      setError("");
      setMessage("");

      if (!selectedHousehold) {
        throw new Error(
          "Please select a household."
        );
      }

      if (!form.choreId) {
        throw new Error(
          "Please select a chore."
        );
      }

      if (!form.assignedTo) {
        throw new Error(
          "Please select a member."
        );
      }

      if (!form.assignedDate) {
        throw new Error(
          "Please select an assigned date."
        );
      }

      if (!form.dueDate) {
        throw new Error(
          "Please select a due date."
        );
      }

      const response = await fetch(
        `${API_URL}/households/${selectedHousehold}/assignments`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },

          body: JSON.stringify({
            choreId: form.choreId,
            assignedTo: form.assignedTo,
            assignedDate: form.assignedDate,
            dueDate: form.dueDate,
            notes: form.notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create assignment."
        );
      }

      setMessage(
        "Assignment created successfully!"
      );

      setForm({
        choreId: "",
        assignedTo: "",
        assignedDate:
          new Date().toISOString().split("T")[0],
        dueDate: "",
        notes: "",
      });

      await loadAssignments(
        selectedHousehold
      );
    } catch (error) {
      setError(error.message);
    }
  }

  async function updateAssignmentStatus(
    assignmentId,
    status
  ) {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/assignments/${assignmentId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update assignment."
        );
      }

      setMessage(
        "Assignment status updated successfully!"
      );

      await loadAssignments(
        selectedHousehold
      );
    } catch (error) {
      setError(error.message);
    }
  }

  function getStatusEmoji(status) {
    switch (status) {
      case "PENDING":
        return "⏳";

      case "IN_PROGRESS":
        return "🔄";

      case "COMPLETED":
        return "✅";

      case "OVERDUE":
        return "⚠️";

      case "SKIPPED":
        return "⏭️";

      default:
        return "📌";
    }
  }

  function formatStatus(status) {
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        Loading households...
      </div>
    );
  }

  if (households.length === 0) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        <h1>Chore Assignments</h1>

        <h2>🏠 No Household Found</h2>

        <p>
          Create or join a household before
          managing assignments.
        </p>

        <button
          onClick={() =>
            navigate("/households")
          }
        >
          Manage Households
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <button
        onClick={() =>
          navigate("/dashboard")
        }
      >
        ← Back to Dashboard
      </button>

      <h1>📋 Chore Assignments</h1>

      <p>
        Assign household chores to members
        and track their progress.
      </p>

      {error && (
        <div
          style={{
            padding: "12px",
            marginTop: "15px",
            marginBottom: "15px",
            border: "1px solid red",
            borderRadius: "8px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {message && (
        <div
          style={{
            padding: "12px",
            marginTop: "15px",
            marginBottom: "15px",
            border: "1px solid green",
            borderRadius: "8px",
          }}
        >
          ✅ {message}
        </div>
      )}

      <hr />

      <h2>Select Household</h2>

      <select
        value={selectedHousehold}
        onChange={handleHouseholdChange}
        style={{
          padding: "10px",
          minWidth: "250px",
        }}
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

      <hr />

      <h2>➕ Create Assignment</h2>

      {chores.length === 0 ? (
        <div>
          <p>
            No chores found in this
            household.
          </p>

          <button
            onClick={() =>
              navigate("/chores")
            }
          >
            Create Chores
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            maxWidth: "500px",
          }}
        >
          <div>
            <label>Chore</label>

            <br />

            <select
              name="choreId"
              value={form.choreId}
              onChange={handleChange}
              required
              style={{
                padding: "10px",
                width: "100%",
              }}
            >
              <option value="">
                Select a chore
              </option>

              {chores.map((chore) => (
                <option
                  key={chore.id}
                  value={chore.id}
                >
                  {chore.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Assign To</label>

            <br />

            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              required
              style={{
                padding: "10px",
                width: "100%",
              }}
            >
              <option value="">
                Select a household member
              </option>

              {members.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Assigned Date</label>

            <br />

            <input
              type="date"
              name="assignedDate"
              value={form.assignedDate}
              onChange={handleChange}
              required
              style={{
                padding: "10px",
                width: "100%",
              }}
            />
          </div>

          <div>
            <label>Due Date</label>

            <br />

            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              required
              style={{
                padding: "10px",
                width: "100%",
              }}
            />
          </div>

          <div>
            <label>Notes (Optional)</label>

            <br />

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add any notes..."
              rows="4"
              style={{
                padding: "10px",
                width: "100%",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "12px",
            }}
          >
            ➕ Create Assignment
          </button>
        </form>
      )}

      <hr />

      <h2>📋 Current Assignments</h2>

      {assignmentsLoading ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p>
          No assignments yet. Create your
          first assignment above.
        </p>
      ) : (
        <div>
          {assignments.map(
            (assignment) => (
              <div
                key={assignment.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "15px",
                }}
              >
                <h3>
                  {assignment.chore_title ||
                    assignment.title ||
                    "Chore"}
                </h3>

                <p>
                  👤 Assigned to:{" "}
                  <strong>
                    {assignment.assigned_to_name ||
                      assignment.member_name ||
                      "Unknown"}
                  </strong>
                </p>

                <p>
                  📅 Assigned Date:{" "}
                  {assignment.assigned_date}
                </p>

                <p>
                  ⏰ Due Date:{" "}
                  {assignment.due_date}
                </p>

                {assignment.notes && (
                  <p>
                    📝 Notes:{" "}
                    {assignment.notes}
                  </p>
                )}

                <p>
                  Status:{" "}
                  <strong>
                    {getStatusEmoji(
                      assignment.status
                    )}{" "}
                    {formatStatus(
                      assignment.status
                    )}
                  </strong>
                </p>

                <label>
                  Update Status
                </label>

                <br />

                <select
                  value={assignment.status}
                  onChange={(event) =>
                    updateAssignmentStatus(
                      assignment.id,
                      event.target.value
                    )
                  }
                  style={{
                    padding: "8px",
                    marginTop: "5px",
                  }}
                >
                  <option value="PENDING">
                    ⏳ Pending
                  </option>

                  <option value="IN_PROGRESS">
                    🔄 In Progress
                  </option>

                  <option value="COMPLETED">
                    ✅ Completed
                  </option>

                  <option value="SKIPPED">
                    ⏭️ Skipped
                  </option>

                  <option value="OVERDUE">
                    ⚠️ Overdue
                  </option>
                </select>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Assignments;