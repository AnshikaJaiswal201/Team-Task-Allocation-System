import { useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import MemberDashboard from "./MemberDashboard";
function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    
    console.log("Token:", data.token);
    console.log("User:", data.user);
    
    localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

if (data.user.role === "admin") {
  window.location.href = "/dashboard";
} else {
  window.location.href = "/member-dashboard";
}

  } catch (error) {
    console.log(error);
    alert("No connection with the server");
  }
};
   const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (window.location.pathname === "/dashboard") {

  if (!token || !user || user.role !== "admin") {
    window.location.href = "/";
    return null;
  }

  return <Dashboard />;
}

if (window.location.pathname === "/member-dashboard") {

  if (!token || !user || user.role !== "member") {
    window.location.href = "/";
    return null;
  }

  return <MemberDashboard />;
}

    
  return (
    <div className="login-container">

      <div className="login-box">

        <h1>Team Task Allocation</h1>
        <p>Login to your account</p>

        <form onSubmit={handleLogin}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

        </form>

      </div>

    </div>
  );
}
export default App;