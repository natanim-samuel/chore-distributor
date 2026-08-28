import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Households() {
  const [households, setHouseholds] = useState([]);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const loadHouseholds = async () => {
    try {
      setLoading(true);

      const response = await api.get("/households");

      setHouseholds(response.data.data.households);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load households."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHouseholds();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    setError("");
    setCreating(true);

    try {
      await api.post("/households", {
        name,
      });

      setName("");

      await loadHouseholds();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create household."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (event) => {
    event.preventDefault();

    setError("");
    setJoining(true);

    try {
      await api.post("/households/join", {
        inviteCode,
      });

      setInviteCode("");

      await loadHouseholds();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to join household."
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <div>
      <h1>My Households</h1>

      {error && <p>{error}</p>}

      <hr />

      <h2>Create Household</h2>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Household name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          required
        />

        <button type="submit" disabled={creating}>
          {creating
            ? "Creating..."
            : "Create Household"}
        </button>
      </form>

      <hr />

      <h2>Join Household</h2>

      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Invite code"
          value={inviteCode}
          onChange={(event) =>
            setInviteCode(event.target.value)
          }
          required
        />

        <button type="submit" disabled={joining}>
          {joining
            ? "Joining..."
            : "Join Household"}
        </button>
      </form>

      <hr />

      <h2>Your Households</h2>

      {loading && <p>Loading households...</p>}

      {!loading && households.length === 0 && (
        <p>You haven't joined any households yet.</p>
      )}

      {!loading &&
        households.map((household) => (
          <div
            key={household.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "10px",
            }}
          >
            <h3>{household.name}</h3>

            <p>Role: {household.role}</p>

            <p>
              Members: {household.member_count}
            </p>

            <Link to={`/households/${household.id}`}>
              View Household
            </Link>
          </div>
        ))}
    </div>
  );
}

export default Households;