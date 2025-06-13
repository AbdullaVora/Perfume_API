const express = require("express");
const { loginUser, registerUser, getUsers, updateUsers, deleteUsers } = require("../../controllers/auth/userControl");
const authMiddleware = require("../../middleware/authToken");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/getUsers", getUsers)
router.put("/editUser/:id",  updateUsers);
router.delete("/deleteUser/:id",  deleteUsers)

module.exports = router;