import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000/api";

function Members() {
  const navigate = useNavigate();

  const [households, setHouseholds] = useState([]);
  const [selectedHousehold, setSelectedHousehold] = useState("");
  const [members, setMembers] = useState([]);

  const [inviteCode, setInviteCode] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (selectedHousehold) {
      loadMembers(selectedHousehold);
    }
  }, [selectedHousehold]);

  function getToken() {
    return localStorage.getItem("token");
  }

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
  }

  async function loadHouseholds() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/households`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          (currentSelected) =>
            currentSelected ||
            loadedHouseholds[0].id
        );
      } else {
        setSelectedHousehold("");
        setMembers([]);
      }
    } catch (error) {
      showMessage(
        error.message || "Failed to load households.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers(householdId) {
    try {
      setMembers([]);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/households/${householdId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load members."
        );
      }

      setMembers(result.data?.members || []);
    } catch (error) {
      showMessage(
        error.message || "Failed to load members.",
        "error"
      );
    }
  }

  async function handleJoin(event) {
    event.preventDefault();

    if (!inviteCode.trim()) {
      showMessage(
        "Please enter an invite code.",
        "error"
      );

      return;
    }

    try {
      setJoining(true);
      setMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/households/join`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            inviteCode: inviteCode.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to join household."
        );
      }

      showMessage(
        "Successfully joined household!"
      );

      setInviteCode("");

      await loadHouseholds();
    } catch (error) {
      showMessage(
        error.message || "Failed to join household.",
        "error"
      );
    } finally {
      setJoining(false);
    }
  }

  async function copyInviteCode() {
    const household = households.find(
      (item) => item.id === selectedHousehold
    );

    if (!household) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        household.invite_code
      );

      showMessage(
        "Invite code copied to clipboard!"
      );
    } catch (error) {
      showMessage(
        "Unable to copy invite code.",
        "error"
      );
    }
  }

  const currentHousehold = households.find(
    (item) => item.id === selectedHousehold
  );

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading household information...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.backButton}
        >
          ← Back to Dashboard
        </button>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Household Members
            </h1>

            <p style={styles.subtitle}>
              Manage your household and invite family members.
            </p>
          </div>

          <div style={styles.memberBadge}>
            👥 {members.length} Members
          </div>
        </div>

        {message && (
          <div
            style={
              messageType === "error"
                ? styles.errorMessage
                : styles.successMessage
            }
          >
            {message}
          </div>
        )}

        {households.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>
              🏠
            </div>

            <h2>
              No Household Yet
            </h2>

            <p>
              Create a household from the dashboard
              or join one using an invite code.
            </p>

            <button
              style={styles.primaryButton}
              onClick={() =>
                navigate("/households")
              }
            >
              Manage Households
            </button>
          </div>
        ) : (
          <>
            <div style={styles.selectCard}>
              <label style={styles.label}>
                Select Household
              </label>

              <select
                value={selectedHousehold}
                onChange={(event) =>
                  setSelectedHousehold(
                    event.target.value
                  )
                }
                style={styles.select}
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

            <div style={styles.mainGrid}>

              <div style={styles.membersSection}>
                <h2 style={styles.sectionTitle}>
                  Members
                </h2>

                {members.length === 0 ? (
                  <div style={styles.emptyMembers}>
                    No members found.
                  </div>
                ) : (
                  <div style={styles.membersList}>
                    {members.map((member) => (
                      <div
                        key={member.id}
                        style={styles.memberCard}
                      >
                        <div style={styles.avatar}>
                          {member.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div style={styles.memberInfo}>
                          <h3 style={styles.memberName}>
                            {member.name}
                          </h3>

                          <p style={styles.memberEmail}>
                            {member.email}
                          </p>
                        </div>

                        <span
                          style={{
                            ...styles.roleBadge,

                            ...(member.role === "OWNER"
                              ? styles.owner
                              : member.role === "ADMIN"
                              ? styles.admin
                              : styles.member),
                          }}
                        >
                          {member.role === "OWNER"
                            ? "👑 Owner"
                            : member.role === "ADMIN"
                            ? "🛡️ Admin"
                            : "👤 Member"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.sideSection}>

                {currentHousehold && (
                  <div style={styles.inviteCard}>
                    <h2 style={styles.sectionTitle}>
                      Invite Someone
                    </h2>

                    <p style={styles.cardText}>
                      Share this invite code with
                      someone you want to add.
                    </p>

                    <div style={styles.codeBox}>
                      {currentHousehold.invite_code}
                    </div>

                    <button
                      onClick={copyInviteCode}
                      style={styles.primaryButton}
                    >
                      📋 Copy Invite Code
                    </button>
                  </div>
                )}

                <div style={styles.joinCard}>
                  <h2 style={styles.sectionTitle}>
                    Join Household
                  </h2>

                  <p style={styles.cardText}>
                    Enter an invite code you received.
                  </p>

                  <form
                    onSubmit={handleJoin}
                    style={styles.joinForm}
                  >
                    <input
                      type="text"
                      placeholder="Enter invite code"
                      value={inviteCode}
                      onChange={(event) =>
                        setInviteCode(
                          event.target.value.toUpperCase()
                        )
                      }
                      style={styles.input}
                      required
                    />

                    <button
                      type="submit"
                      disabled={joining}
                      style={{
                        ...styles.primaryButton,
                        opacity: joining ? 0.7 : 1,
                      }}
                    >
                      {joining
                        ? "Joining..."
                        : "Join Household"}
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
  },

  backButton: {
    background: "transparent",
    border: "none",
    color: "#4f46e5",
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "25px",
    fontWeight: "600",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    color: "#1f2937",
    fontSize: "32px",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: "8px",
  },

  memberBadge: {
    background: "#e0e7ff",
    color: "#4338ca",
    padding: "10px 15px",
    borderRadius: "20px",
    fontWeight: "600",
  },

  successMessage: {
    background: "#dcfce7",
    color: "#166534",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  errorMessage: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  selectCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "25px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
  },

  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "25px",
  },

  membersSection: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  sideSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  sectionTitle: {
    marginTop: 0,
    color: "#1f2937",
  },

  membersList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  memberCard: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
  },

  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "#4f46e5",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
    fontWeight: "bold",
    marginRight: "15px",
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    margin: 0,
    color: "#1f2937",
  },

  memberEmail: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  roleBadge: {
    padding: "7px 10px",
    borderRadius: "15px",
    fontSize: "13px",
    fontWeight: "600",
  },

  owner: {
    background: "#fef3c7",
    color: "#92400e",
  },

  admin: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },

  member: {
    background: "#f3f4f6",
    color: "#374151",
  },

  inviteCard: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  joinCard: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  cardText: {
    color: "#6b7280",
    lineHeight: "1.5",
  },

  codeBox: {
    background: "#f3f4f6",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    letterSpacing: "2px",
    marginBottom: "15px",
    color: "#4f46e5",
  },

  joinForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    textTransform: "uppercase",
  },

  primaryButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#4f46e5",
    color: "white",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },

  emptyCard: {
    background: "white",
    padding: "50px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  emptyIcon: {
    fontSize: "50px",
  },

  emptyMembers: {
    padding: "30px",
    textAlign: "center",
    color: "#6b7280",
  },
};

export default Members;