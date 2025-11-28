require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

//Thầy tạo file .env cho MongoBD Atlas của thầy nhé
//Em có dùng AI Agent để gen 1 phần code, AI gen logic rất chặt chẽ. Tuy nhiên em cũng review lại và đều hiểu hết phần code logic này.  
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'userManagement';
const COLLECTION_NAME = 'anh.th225164';

let db;
let usersCollection;

// Middleware
app.use(express.json());

// Error handling for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format'
    });
  }
  next();
});

// Connect to MongoDB Atlas
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    db = client.db(DB_NAME);
    usersCollection = db.collection(COLLECTION_NAME);
    
    console.log('Successfully connected to MongoDB Atlas');
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error.message);
    process.exit(1);
  }
}

// GET API
app.get('/api/users/:id?', async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching users'
    });
  }
});

// POST API - Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required fields'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Age validation (if provided)
    if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 150)) {
      return res.status(400).json({
        success: false,
        error: 'Age must be a number between 0 and 150'
      });
    }

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user object
    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      age: age || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user into database
    const result = await usersCollection.insertOne(newUser);

    // Fetch the created user
    const createdUser = await usersCollection.findOne({ _id: result.insertedId });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: createdUser
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while creating user'
    });
  }
});

// PUT API - Update a user by ID
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Build update object with only provided fields
    const updateData = {};

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Name cannot be empty'
        });
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (!email || email.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Email cannot be empty'
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Check if email already exists for another user
      const emailExists = await usersCollection.findOne({ 
        email: email.trim().toLowerCase(),
        _id: { $ne: new ObjectId(id) }
      });
      
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists for another user'
        });
      }

      updateData.email = email.trim().toLowerCase();
    }

    if (age !== undefined) {
      if (age !== null && (typeof age !== 'number' || age < 0 || age > 150)) {
        return res.status(400).json({
          success: false,
          error: 'Age must be a number between 0 and 150'
        });
      }
      updateData.age = age;
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    // Update user
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated user
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(id) });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while updating user'
    });
  }
});

// DELETE API - Delete a user by ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user
    await usersCollection.deleteOne({ _id: new ObjectId(id) });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: existingUser
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while deleting user'
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred'
  });
});

// Start server
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API Endpoints:`);
    console.log(`  GET    /api/users     - Get all users`);
    console.log(`  GET    /api/users/:id - Get user by ID`);
    console.log(`  POST   /api/users     - Create new user`);
    console.log(`  PUT    /api/users/:id - Update user by ID`);
    console.log(`  DELETE /api/users/:id - Delete user by ID`);
  });
}

startServer();
