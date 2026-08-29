import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Households from "./pages/Households";
import HouseholdDetails from "./pages/HouseholdDetails";
import Chores from "./pages/Chores";
import Members from "./pages/Members";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/households" element={<Households />} />
        <Route path="/households/:id" element={<HouseholdDetails />}/>
        <Route path="/chores" element={<Chores />}/>
        <Route path="/members" element={<Members /> }/>

      </Route>
    </Routes>
  );
}

export default App;

