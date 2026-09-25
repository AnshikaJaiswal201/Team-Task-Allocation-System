import { useState, useEffect } from "react";

function MemberDashboard() {

    const [tasks, setTasks] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));
    useEffect(() => {

        const fetchMyTasks = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/my-tasks",
                    {
                        headers: {
                            Authorization:token
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setTasks(data);
                } else {
                    console.log(data.message);
                }

            } catch (error) {
                console.log(error);
            }

        };

        fetchMyTasks();


    }, []);

    const updateStatus = async (taskId, newStatus) => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/tasks/${taskId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:token
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Task status updated successfully");

            // Refresh tasks
            const updatedResponse = await fetch(
                "http://localhost:5000/my-tasks",
                {
                    headers: {
                        Authorization:token
                    }
                }
            );

            const updatedData = await updatedResponse.json();

            if (updatedResponse.ok) {
                setTasks(updatedData);
            }

        } catch (error) {

            console.log(error);
            alert("Server connection error");

        }

    };
    return (

        <div className="member-dashboard">

            <header className="member-dashboard-header">

                <h1>Member Dashboard</h1>

                <div>
                    <span>
                        Welcome, {user?.name}
                    </span>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            window.location.href = "/";
                        }}
                    >
                        Logout
                    </button>
                </div>

            </header>


            <main className="member-dashboard-content">

                <h2>My Tasks</h2>
                <div className="member-stats">

                    <div className="member-stat-card">
                        <h3>{tasks.length}</h3>
                        <p>Total Tasks</p>
                    </div>

                    <div className="member-stat-card">
                        <h3>
                            {tasks.filter(task => task.status === "Pending").length}
                        </h3>
                        <p>Pending</p>
                    </div>

                    <div className="member-stat-card">
                        <h3>
                            {tasks.filter(task => task.status === "In Progress").length}
                        </h3>
                        <p>In Progress</p>
                    </div>

                    <div className="member-stat-card">
                        <h3>
                            {tasks.filter(task => task.status === "Completed").length}
                        </h3>
                        <p>Completed</p>
                    </div>

                </div>
                <div className="member-tasks">

                    {tasks.length === 0 ? (

                        <p>No tasks assigned to you.</p>

                    ) : (

                        tasks.map((task) => (

                            <div
                                className="member-task-card"
                                key={task.id}
                            >

                                <h3>{task.title}</h3>

                                <p>{task.description}</p>

                                <div className="member-task-info">

                                    <span>
                                        Priority: {task.priority}
                                    </span>

                                    <div className="status-section">

                                        <label>Status:</label>

                                        <span className={`status-badge ${task.status.toLowerCase().replace(" ", "-")}`}>
                                            {task.status}
                                        </span>

                                        <select
                                            value={task.status}
                                            onChange={(e) =>
                                                updateStatus(task.id, e.target.value)
                                            }
                                        >
                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="In Progress">
                                                In Progress
                                            </option>

                                            <option value="Completed">
                                                Completed
                                            </option>
                                        </select>

                                    </div>

                                    <span>
                                        Deadline:{" "}
                                        {task.deadline
                                            ? new Date(task.deadline)
                                                .toLocaleDateString()
                                            : "Not set"
                                        }
                                    </span>

                                </div>

                            </div>

                        ))

                    )}

                </div>
            </main>
        </div>

    );

}

export default MemberDashboard;