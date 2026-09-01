import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000/api";

function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [households, setHouseholds] = useState([]);
  const [selectedHousehold, setSelectedHousehold] = useState("");

  const [members, setMembers] = useState([]);
  const [chores, setChores] = useState([]);
  const [assignments, setAssignments] = useState([]);

  function getToken() {
    return localStorage.getItem("accessToken");
  }

  function authHeaders() {
    return {
      Authorization: `Bearer ${getToken()}`,
    };
  }

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (selectedHousehold) {
      loadDashboardData(selectedHousehold);
    }
  }, [selectedHousehold]);

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
      } else {
        setLoading(false);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function loadDashboardData(householdId) {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.all([
        fetch(
          `${API_URL}/households/${householdId}/members`,
          {
            headers: authHeaders(),
          }
        ),

        fetch(
          `${API_URL}/households/${householdId}/chores`,
          {
            headers: authHeaders(),
          }
        ),

        fetch(
          `${API_URL}/households/${householdId}/assignments`,
          {
            headers: authHeaders(),
          }
        ),
      ]);

      const [
        membersResponse,
        choresResponse,
        assignmentsResponse,
      ] = results;

      const membersResult =
        await membersResponse.json();

      const choresResult =
        await choresResponse.json();

      const assignmentsResult =
        await assignmentsResponse.json();

      if (!membersResponse.ok) {
        throw new Error(
          membersResult.message ||
            "Failed to load members."
        );
      }

      if (!choresResponse.ok) {
        throw new Error(
          choresResult.message ||
            "Failed to load chores."
        );
      }

      if (!assignmentsResponse.ok) {
        throw new Error(
          assignmentsResult.message ||
            "Failed to load assignments."
        );
      }

      setMembers(
        membersResult.data?.members || []
      );

      setChores(
        choresResult.data?.chores || []
      );

      setAssignments(
        assignmentsResult.data?.assignments || []
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getStatusCount(status) {
    return assignments.filter(
      (assignment) =>
        assignment.status === status
    ).length;
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
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
        return "📋";
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
        }}
      >
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>🏠 Household Dashboard</h1>

      <p>
        Manage your household chores and
        assignments in one place.
      </p>

      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            border: "1px solid red",
            borderRadius: "8px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* HOUSEHOLD SELECTOR */}

      {households.length > 0 ? (
        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <label>
            <strong>Select Household</strong>
          </label>

          <br />

          <select
            value={selectedHousehold}
            onChange={(event) =>
              setSelectedHousehold(
                event.target.value
              )
            }
            style={{
              padding: "10px",
              marginTop: "8px",
              minWidth: "250px",
            }}
          >
            {households.map(
              (household) => (
                <option
                  key={household.id}
                  value={household.id}
                >
                  {household.name}
                </option>
              )
            )}
          </select>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "25px",
            borderRadius: "10px",
            marginBottom: "25px",
          }}
        >
          <h2>🏠 No Household Yet</h2>

          <p>
            Create or join a household to
            start managing chores.
          </p>

          <button
            onClick={() =>
              navigate("/households")
            }
          >
            Manage Households
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      {households.length > 0 && (
        <>
          <h2>📊 Overview</h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              marginBottom: "30px",
            }}
          >
            <DashboardCard
              title="Households"
              value={households.length}
              icon="🏠"
            />

            <DashboardCard
              title="Members"
              value={members.length}
              icon="👥"
            />

            <DashboardCard
              title="Chores"
              value={chores.length}
              icon="🧹"
            />

            <DashboardCard
              title="Assignments"
              value={assignments.length}
              icon="📋"
            />
          </div>

          {/* ASSIGNMENT STATUS */}

          <h2>📈 Assignment Status</h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              marginBottom: "30px",
            }}
          >
            <DashboardCard
              title="Pending"
              value={getStatusCount(
                "PENDING"
              )}
              icon="⏳"
            />

            <DashboardCard
              title="In Progress"
              value={getStatusCount(
                "IN_PROGRESS"
              )}
              icon="🔄"
            />

            <DashboardCard
              title="Completed"
              value={getStatusCount(
                "COMPLETED"
              )}
              icon="✅"
            />

            <DashboardCard
              title="Overdue"
              value={getStatusCount(
                "OVERDUE"
              )}
              icon="⚠️"
            />
          </div>

          {/* QUICK ACTIONS */}

          <h2>⚡ Quick Actions</h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "35px",
            }}
          >
            <button
              onClick={() =>
                navigate("/households")
              }
            >
              🏠 Manage Households
            </button>

            <button
              onClick={() =>
                navigate("/chores")
              }
            >
              🧹 Manage Chores
            </button>

            <button
              onClick={() =>
                navigate("/members")
              }
            >
              👥 Household Members
            </button>

            <button
              onClick={() =>
                navigate("/assignments")
              }
            >
              📋 Manage Assignments
            </button>
          </div>

          {/* RECENT ASSIGNMENTS */}

          <h2>🕒 Recent Assignments</h2>

          {assignments.length === 0 ? (
            <div
              style={{
                border: "1px solid #ccc",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <p>
                No assignments yet.
              </p>

              <button
                onClick={() =>
                  navigate("/assignments")
                }
              >
                Create Assignment
              </button>
            </div>
          ) : (
            <div>
              {assignments
                .slice(0, 5)
                .map((assignment) => (
                  <div
                    key={assignment.id}
                    style={{
                      border:
                        "1px solid #ccc",
                      borderRadius: "10px",
                      padding: "15px",
                      marginBottom: "10px",
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
                      📅 Due:{" "}
                      {assignment.due_date}
                    </p>

                    <strong>
                      {getStatusEmoji(
                        assignment.status
                      )}{" "}
                      {formatStatus(
                        assignment.status
                      )}
                    </strong>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "20px",
        minWidth: "160px",
        flex: "1",
      }}
    >
      <div
        style={{
          fontSize: "30px",
        }}
      >
        {icon}
      </div>

      <h3>{title}</h3>

      <h1>{value}</h1>
    </div>
  );
}

export default Dashboard;