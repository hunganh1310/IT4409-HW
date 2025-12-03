const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
// Middleware
app.use(cors());
app.use(express.json());

mongoose
 .connect("mongodb+srv://20225164:hunganh1310@20225164.vaxqvdk.mongodb.net/?appName=20225164")
 .then(() => console.log("Connected to MongoDB"))
 .catch((err) => console.error("MongoDB Error:", err));
// Create Schema
const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        age: { type: Number, min: 0 },
        email: { type: String, required: true, lowercase: true, trim: true },
        address: { type: String, trim: true }
    },
    { timestamps: true }
);
const User = mongoose.model("User", UserSchema);

// Implement API endpoints
app.get("/api/users", async (req, res) => {
    try {
        // Query params
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 5;
        const search = req.query.search ? String(req.query.search) : "";

        // Create filter for search
        const filter = search
            ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } }
                    ]
                }
            : {};

        const skip = (page - 1) * limit;

        // Query database in parallel
        const [users, total] = await Promise.all([
            User.find(filter).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(total / limit);

        // Return response
        res.json({ page, limit, total, totalPages, data: users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/users", async (req, res) => {
    try {
        const { name, age, email, address } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email là bắt buộc" });
        }

        const emailNorm = String(email).toLowerCase().trim();

        const existing = await User.findOne({ email: emailNorm });
        if (existing) {
            return res.status(400).json({ error: "Email đã tồn tại" });
        }

        const newUser = await User.create({ name, age, email: emailNorm, address });
        res.status(201).json({ message: "Tạo người dùng thành công", data: newUser });
    } catch (err) {
        // Handle duplicate email error
        if (err && err.code === 11000) { // lỗi duplicate key của MongoDB
            return res.status(400).json({ error: "Email đã tồn tại" });
        }
        res.status(400).json({ error: err.message });
    }
});

app.put("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, email, address } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, age, email, address },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }
        res.json({ message: "Cập nhật người dùng thành công", data: updatedUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }
        res.json({ message: "Xóa người dùng thành công" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Start server
app.listen(3001, () => {
 console.log("Server running on http://localhost:3001");
});
