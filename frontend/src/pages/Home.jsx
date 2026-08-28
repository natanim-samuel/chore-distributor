import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <h1>Chore Distributor</h1>

      <p>
        Make household chores easier, fairer, and more organized.
      </p>

      {isAuthenticated ? (
        <Link to="/dashboard">Go to Dashboard</Link>
      ) : (
        <>
          <Link to="/login">Login</Link>
          {" | "}
          <Link to="/register">Create Account</Link>
        </>
      )}
    </div>
  );
}

export default Home;