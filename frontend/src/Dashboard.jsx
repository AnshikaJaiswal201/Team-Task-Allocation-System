import { useState, useEffect } from "react";
import "./App.css";

function Dashboard() {
    const [taskSearch, setTaskSearch] = useState("");
    const [taskStatusFilter, setTaskStatusFilter] = useState("All");
    const user = JSON.parse(localStorage.getItem("user"));

    const [stats, setStats] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0
    });

    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [deadline, setDeadline] = useState("");

    const [editingTaskId, setEditingTaskId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [memberName, setMemberName] = useState("");
    const [memberEmail, setMemberEmail] = useState("");
    const [memberPassword, setMemberPassword] = useState("");
    // =========================
    // FETCH STATS
    // =========================

    useEffect(() => {

        const fetchStats = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/task-stats",
                    {
                        headers: {
                            Authorization: token
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setStats(data);
                }

            } catch (error) {
                console.log("Stats Error:", error);
            }

        };

        fetchStats();

    }, []);


    // =========================
    // FETCH MEMBERS
    // =========================

    useEffect(() => {

        const fetchMembers = async () => {

            try {

                const token = localStorage.getItem("token");
                console.log("TOKEN FROM DASHBOARD:", token);
                const response = await fetch(
                    "http://localhost:5000/members",
                    {
                        headers: {
                            Authorization: token
                        }
                    }
                );

                const data = await response.json();
                if (!response.ok) {
                    alert(data.message || "Failed to fetch members");
                    return;
                }

                setMembers(data);

            } catch (error) {

                console.log("Members Error:", error);
                alert("Unable to load team members");

            }

        };

        fetchMembers();

    }, []);


    // =========================
    // FETCH TASKS
    // =========================

    useEffect(() => {

        const fetchTasks = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/tasks",
                    {
                        headers: {
                            Authorization: token
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setTasks(data);
                }

            } catch (error) {
                console.log("Tasks Error:", error);
            }

        };

        fetchTasks();

    }, []);


    // =========================
    // CREATE TASK
    // =========================

    const createTask = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/tasks",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token
                    },

                    body: JSON.stringify({
                        title: taskTitle,
                        description: taskDescription,
                        assigned_to: assignedTo,
                        priority: priority,
                        deadline: deadline
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);
                return;

            }

            alert("Task Created Successfully");

            window.location.reload();

        } catch (error) {

            console.log(error);
            alert("Server connection error");

        }

    };


    // =========================
    // EDIT TASK - LOAD DATA
    // =========================

    const editTask = (task) => {

        setEditingTaskId(task.id);
        setIsEditing(true);

        setTaskTitle(task.title || "");
        setTaskDescription(task.description || "");

        setAssignedTo(
            task.assigned_to
                ? String(task.assigned_to)
                : ""
        );

        setPriority(task.priority || "Medium");

        setDeadline(
            task.deadline
                ? task.deadline.split("T")[0]
                : ""
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    // =========================
    // UPDATE TASK
    // =========================

    const updateTask = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/tasks/${editingTaskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token
                    },

                    body: JSON.stringify({
                        title: taskTitle,
                        description: taskDescription,
                        assigned_to: assignedTo,
                        priority: priority,
                        deadline: deadline
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);
                return;

            }

            alert("Task updated successfully");

            setIsEditing(false);
            setEditingTaskId(null);

            setTaskTitle("");
            setTaskDescription("");
            setAssignedTo("");
            setPriority("Medium");
            setDeadline("");

            window.location.reload();

        } catch (error) {

            console.log(error);
            alert("Server connection error");

        }

    };


    // =========================
    // CANCEL EDIT
    // =========================

    const cancelEdit = () => {

        setIsEditing(false);
        setEditingTaskId(null);

        setTaskTitle("");
        setTaskDescription("");
        setAssignedTo("");
        setPriority("Medium");
        setDeadline("");

    };


    // =========================
    // DELETE TASK
    // =========================

    const deleteTask = async (taskId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/tasks/${taskId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: token
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);
                return;

            }

            alert("Task deleted successfully");

            setTasks(
                tasks.filter(
                    (task) => task.id !== taskId
                )
            );

        } catch (error) {

            console.log(error);
            alert("Server connection error");

        }

    };


    // =========================
    // LOGOUT
    // =========================

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";

    };

    const addMember = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/members", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token
                },
                body: JSON.stringify({
                    name: memberName,
                    email: memberEmail,
                    password: memberPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Member added successfully");

            setMemberName("");
            setMemberEmail("");
            setMemberPassword("");
            setShowMemberForm(false);

        } catch (error) {
            console.log("Add Member Error:", error);
            alert(error.message);
        }
    };

    const removeMember = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/members/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: token
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert("Member removed successfully");

            setMembers(
                members.filter((member) => member.id !== id)
            );

        } catch (error) {
            console.log("Remove Member Error:", error);
            alert(error.message);
        }
    };
    // =========================
    // UI
    // =========================

    return (

        <div className="dashboard">

            {/* HEADER */}

            <header className="dashboard-header">

                <h1>
                    Team Task Allocation
                </h1>

                <div>

                    <span>
                        Welcome, {user?.name}
                    </span>

                    <button onClick={logout}>
                        Logout
                    </button>

                </div>

            </header>


            <main className="dashboard-content">


                {/* DASHBOARD TITLE */}

                <h2>
                    Admin Dashboard
                </h2>


                {/* STATS */}

                <div className="stats">

                    <div className="stat-card">
                        <h3>Total Tasks</h3>
                        <p>{stats.totalTasks}</p>
                    </div>

                    <div className="stat-card">
                        <h3>Pending</h3>
                        <p>{stats.pendingTasks}</p>
                    </div>

                    <div className="stat-card">
                        <h3>In Progress</h3>
                        <p>{stats.inProgressTasks}</p>
                    </div>

                    <div className="stat-card">
                        <h3>Completed</h3>
                        <p>{stats.completedTasks}</p>
                    </div>

                </div>


                {/* TEAM MEMBERS */}

               
                <h2>
                    Team Members
                </h2>

                <button
                    type="button"
                    onClick={() => setShowMemberForm(true)}
                    className="add-member-btn"
                >
                    + Add Member
                </button>

                {showMemberForm && (
                    <div className="member-form">
                        <h3>Add Team Member</h3>

                        <input
                            type="text"
                            placeholder="Enter member name"
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                        />

                        <input
                            type="email"
                            placeholder="Enter member email"
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Enter password"
                            value={memberPassword}
                            onChange={(e) => setMemberPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            onClick={addMember}
                        >
                            Add Member
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowMemberForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className="members-list">
                    {members.map((member) => (
                        <div
                            className="member-card"
                            key={member.id}
                        >
                            <h3>{member.name}</h3>
                            <p>{member.email}</p>
                            <span>{member.role}</span>

                            <button
                                type="button"
                                className="remove-member-btn"
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to remove this member?")) { removeMember(member.id) }
                                }}
                            >
                                Remove Member
                            </button>
                        </div>
                    ))}
                </div>



                <h2>
                    {isEditing
                        ? "Edit Task"
                        : "Create New Task"
                    }
                </h2>


                <form
                    className="task-form"
                    onSubmit={(e) => {

                        e.preventDefault();

                        if (isEditing) {
                            updateTask();
                        } else {
                            createTask();
                        }

                    }}
                >

                    {/* TITLE */}

                    <input
                        type="text"
                        placeholder="Task Title"
                        value={taskTitle}
                        onChange={(e) =>
                            setTaskTitle(e.target.value)
                        }
                        required
                    />


                    {/* DESCRIPTION */}

                    <textarea
                        placeholder="Task Description"
                        value={taskDescription}
                        onChange={(e) =>
                            setTaskDescription(e.target.value)
                        }
                        required
                    />


                    {/* MEMBER DROPDOWN */}

                    <select
                        value={assignedTo}
                        onChange={(e) =>
                            setAssignedTo(e.target.value)
                        }
                        required
                    >

                        <option value="">
                            Select Member
                        </option>

                        {members.map((member) => (

                            <option
                                key={member.id}
                                value={member.id}
                            >
                                {member.name}
                            </option>

                        ))}

                    </select>


                    {/* PRIORITY */}

                    <select
                        value={priority}
                        onChange={(e) =>
                            setPriority(e.target.value)
                        }
                    >

                        <option value="Low">
                            Low
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="High">
                            High
                        </option>

                    </select>


                    {/* DEADLINE */}

                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) =>
                            setDeadline(e.target.value)
                        }
                        required
                    />


                    {/* BUTTON */}

                    <button type="submit">

                        {isEditing
                            ? "Update Task"
                            : "Create Task"
                        }

                    </button>


                    {/* CANCEL */}

                    {isEditing && (

                        <button
                            type="button"
                            onClick={cancelEdit}
                            style={{
                                background: "#6b7280",
                                marginTop: "10px"
                            }}
                        >
                            Cancel
                        </button>

                    )}

                </form>




                <h2>
                    All Tasks
                </h2>
                <div className="task-search">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                    />
                </div>
                <div className="tasks-list">

                    {tasks.length === 0 ? (

                        <p>
                            No tasks available.
                        </p>
                        

                    ) : (
                        <><div className="task-filter">
            <select
                value={taskStatusFilter}
                onChange={(e) =>
                    setTaskStatusFilter(e.target.value)
                }
            >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
            </select>
        </div>
{
                        tasks
                            .filter((task) =>
                                task.title.toLowerCase().includes(taskSearch.toLowerCase())&&
        (taskStatusFilter === "All" ||
            task.status === taskStatusFilter)

                            )
                            
    
                            .map((task) => (

                                <div
                                    className="task-card"
                                    key={task.id}
                                >

                                    <div className="task-details">

                                        <h3>
                                            {task.title}
                                        </h3>

                                        <p>
                                            {task.description}
                                        </p>

                                    </div>


                                    <div className="task-info">

                                        <span>
                                            Priority: {task.priority}
                                        </span>

                                        <span>
                                            Status: {task.status}
                                        </span>

                                        <span>
                                            Deadline:{" "}

                                            {task.deadline
                                                ? new Date(
                                                    task.deadline
                                                ).toLocaleDateString()
                                                : "Not set"
                                            }

                                        </span>

                                    </div>


                                    <div className="task-actions">

                                        <button
                                            type="button"
                                            className="edit-btn"
                                            onClick={() =>
                                                editTask(task)
                                            }
                                        >
                                            Edit
                                        </button>


                                        <button
                                            type="button"
                                            className="delete-btn"
                                            onClick={() => {
                                                (window.confirm("Are you sure you want to delete this task?"))
                                                {
                                                    deleteTask(task.id)
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}
                            </>

                    )}

                </div>

            </main>

        </div>

    );
}

export default Dashboard;