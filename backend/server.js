// express-Noe.js framework that use to create backnd/server and APIs.
// cors-help to communicate frontend and backend.returns midle
// react F=localhost:5173
// Backend-localhost:5000
// both are diff origins that's why we need cors configuration
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");

// app-it store..express application /server instance ...and we can control backend
const app = express();
app.use(cors());
app.use(express.json());
const db = require("./config/db");
app.get("/", (req, res) => {
  res.send("Team Task Allocation API Working");
});

// Register
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Registration failed" });
      }

      res.status(201).json({
        message: "User registered successfully"
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Server-error"
    });
  }
});


// Login
app.post("/login", (req, res) => {

  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      "mySecretKey",
      {
        expiresIn: "1h"
      }
    );
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;
   
  if (!authHeader) {
    return res.status(401).json({
      message: "Token not provided"
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  jwt.verify(token, "mySecretKey", (err, decoded) => {

    if (err) {
      

      return res.status(403).json({
        message: "Invalid token"
      });
    }

    req.user = decoded;
    next();
  });
};
app.get("/profile", verifyToken, (req, res) => {

    res.json({
        message: "Protected route accessed",
        user: req.user
    });

});



const verifyAdmin = (req, res, next) => {

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access only"
        });
    }

    next();
};
app.post("/members", verifyToken, verifyAdmin, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'member')";

    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to add member"
        });
      }

      res.status(201).json({
        message: "Member added successfully"
      });
    });
  } catch (error) {
  

    res.status(500).json({
      message: "Server error"
    });
  }
});
app.delete("/members/:id", verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM users WHERE id = ? AND role = 'member'";

  db.query(sql, [id], (err, result) => {
    if (err) {
      
      return res.status(500).json({
        message: "Failed to remove member"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    res.json({
      message: "Member removed successfully"
    });
  });
});
app.get("/admin", verifyToken, verifyAdmin, (req, res) => {

    res.json({
        message: "Welcome Admin"
    });

});

app.post("/tasks",verifyToken,verifyAdmin,(req,res)=>{
  const{
    title,
    description,
    assigned_to,
    priority,
    deadline
  }=req.body;
  const sql=`Insert into tasks (title,description,assigned_to,priority,deadline,created_by) VALUES(?,?,?,?,?,?)`;

  db.query(sql,[
    title,
    description,
    assigned_to,
    priority,
    deadline,
    req.user.id
  ],
(err,result)=>{
  if(err){
    console.log(err);
    return res.status(500).json({
      message:"Task creation failed"
    });
  }
  res.status(201).json({
    message:"Task Created Successfully"
  });
}
);
});

app.get("/tasks", verifyToken, verifyAdmin, (req, res) => {

  const sql = "SELECT * FROM tasks";

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch tasks"
      });
    }

    res.status(200).json(results);

  });

});
// for logged in member
app.get("/my-tasks", verifyToken, (req, res) => {

  const userId = req.user.id;

  const sql = "SELECT * FROM tasks WHERE assigned_to = ?";

  db.query(sql, [userId], (err, results) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch tasks"
      });
    }

    res.status(200).json(results);

  });

});
app.put("/tasks/:id/status", verifyToken, (req, res) => {

  const taskId = req.params.id;
  const { status } = req.body;

  const sql = `
    UPDATE tasks 
    SET status = ? 
    WHERE id = ? AND assigned_to = ?
  `;

  db.query(
    sql,
    [status, taskId, req.user.id],
    (err, result) => {

      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Failed to update task status"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(403).json({
          message: "You cannot update this task"
        });
      }

      res.status(200).json({
        message: "Task status updated successfully"
      });

    }
  );

});

app.delete("/tasks/:id", verifyToken, verifyAdmin, (req, res) => {

  const taskId = req.params.id;

  const sql = "DELETE FROM tasks WHERE id = ?";

  db.query(sql, [taskId], (err, result) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to delete task"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json({
      message: "Task deleted successfully"
    });

  });

});

app.put("/tasks/:id", verifyToken, verifyAdmin, (req, res) => {

  const taskId = req.params.id;

  const {
    title,
    description,
    assigned_to,
    priority,
    deadline
  } = req.body;

  const sql = `
    UPDATE tasks
    SET title = ?,
        description = ?,
        assigned_to = ?,
        priority = ?,
        deadline = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title,
      description,
      assigned_to,
      priority,
      deadline,
      taskId
    ],
    (err, result) => {

      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Failed to update task"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Task not found"
        });
      }

      res.status(200).json({
        message: "Task updated successfully"
      });

    }
  );

});

// Admin Dashboard Summary/Count
app.get("/task-stats", verifyToken, verifyAdmin, (req, res) => {

  const sql = `
    SELECT
      COUNT(*) AS totalTasks,
      SUM(status = 'Pending') AS pendingTasks,
      SUM(status = 'In Progress') AS inProgressTasks,
      SUM(status = 'Completed') AS completedTasks
    FROM tasks
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch task statistics"
      });
    }

    res.status(200).json(results[0]);

  });

});

// Admin team mebers API
app.get("/members", verifyToken, verifyAdmin, (req, res) => {

  const sql = `
    SELECT id, name, email, role
    FROM users
    WHERE role = 'member'
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch members"
      });
    }

    res.status(200).json(results);

  });

});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 