
// Banking API with JWT Authentication
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = "mysecretkey";

// Hardcoded user
const user = {
  username: "user1",
  password: "password123",
};

// Mock balance
let balance = 1000;

// Middleware for verifying JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Authorization header missing or incorrect" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = userData;
    next();
  });
}

// Login Route (returns JWT token)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === user.username && password === user.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Protected Routes
app.get("/balance", authenticateToken, (req, res) => {
  res.json({ balance });
});

app.post("/deposit", authenticateToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid deposit amount" });

  balance += amount;
  res.json({ message: `Deposited $${amount}`, newBalance: balance });
});

app.post("/withdraw", authenticateToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid withdrawal amount" });
  if (amount > balance) return res.status(400).json({ message: "Insufficient funds" });

  balance -= amount;
  res.json({ message: `Withdrew $${amount}`, newBalance: balance });
});

app.listen(3000, () => console.log("✅ Banking API running on http://localhost:3000"));
