import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={() => navigate("/households")}>
        Manage My Households
      </button>
        <br></br>
      <button onClick={() => navigate("/chores")}>
        Manage Chores
      </button>
        <br></br>
      <button onClick={() => navigate("/members")}>
       Manage Members
       </button>
    </div>
  );
}

export default Dashboard;