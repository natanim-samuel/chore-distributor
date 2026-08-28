import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function HouseholdDetails() {
  const { id } = useParams();

  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHousehold = async () => {
      try {
        setLoading(true);

        const householdResponse = await api.get(
          `/households/${id}`
        );

        const membersResponse = await api.get(
          `/households/${id}/members`
        );

        setHousehold(
          householdResponse.data.data.household
        );

        setMembers(
          membersResponse.data.data.members
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load household."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHousehold();
  }, [id]);

  if (loading) {
    return <div>Loading household...</div>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <Link to="/households">
          Back to Households
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/households">
        ← Back to Households
      </Link>

      <h1>{household.name}</h1>

      <p>
        Your Role: <strong>{household.role}</strong>
      </p>

      <h2>Invite Code</h2>

      <p>
        <strong>{household.invite_code}</strong>
      </p>

      <hr />

      <h2>Members ({members.length})</h2>

      {members.map((member) => (
        <div
          key={member.id}
          style={{
            border: "1px solid #ccc",
            padding: "12px",
            marginBottom: "10px",
          }}
        >
          <h3>{member.name}</h3>

          <p>{member.email}</p>

          <p>
            Role: <strong>{member.role}</strong>
          </p>
        </div>
      ))}
    </div>
  );
}

export default HouseholdDetails;