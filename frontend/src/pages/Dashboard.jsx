import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Chore Distributor</h1>

      <h2>Welcome, {user?.name}! 👋</h2>

      <p>Manage your households and distribute chores fairly.</p>

      <hr />

      <Link to="/households">
        Manage My Households
      </Link>

      <br />
      <br />

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;