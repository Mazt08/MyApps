const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user1", password: "pass1", role: "user" },
];

let currentLoggedIn = null;

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) { currentLoggedIn = user; res.json({ success: true, user }); }
  else res.status(401).json({ success: false, message: "Invalid credentials" });
});

app.post("/logout", (req, res) => { currentLoggedIn = null; res.json({ success: true }); });

app.get("/current-user", (req, res) => { res.json({ currentUser: currentLoggedIn }); });

app.post("/add-user", (req, res) => {
  const { username, password, role } = req.body;
  if (users.find(u => u.username === username)) return res.status(400).json({ success: false });
  const newUser = { id: users.length + 1, username, password, role: role || 'user' };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

app.get("/users", (req, res) => { res.json(users); });

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
