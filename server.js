const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

// Create users table
function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Users table ready.');
        }
    });
}

// API Routes

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    try {
        // Check if user already exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (row) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            db.run(
                'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                function (err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Error creating user account'
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: 'Registration successful',
                        user: {
                            id: this.lastID,
                            name: name,
                            email: email
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        try {
            // Compare password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Update last login
            db.run(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [user.id]
            );

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.full_name,
                    email: user.email
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    });
});

// Generate Content endpoint (AI integration)
app.get('/api/generate', async (req, res) => {
    try {
        // Add random seed to prompt to prevent caching and get unique results every time
        const randomSeed = Math.floor(Math.random() * 1000000);
        const prompt = `random seed: ${randomSeed}. generate a unique aesthetic social media collage caption, 5 distinct hashtags, and 3 currently trending songs. Return ONLY valid JSON with keys: 'caption' (string), 'hashtags' (array of strings), 'songs' (array of objects with 'title' and 'artist'). Make it different every time!`;
        const response = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch from AI API');
        }

        const text = await response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            res.json(data);
        } else {
            throw new Error('Invalid JSON format from AI');
        }
    } catch (error) {
        console.error('AI Generation Error:', error);
        // Fallback to static content if AI fails
        res.json({
            caption: "Living my best life one adventure at a time ✨",
            hashtags: ["#AestheticVibes", "#CollageMagic", "#InstaArt", "#Memories", "#MoodBoard"],
            songs: [
                { title: "Born to Shine", artist: "Diljit Dosanjh" },
                { title: "Starboy", artist: "The Weeknd" },
                { title: "As It Was", artist: "Harry Styles" }
            ]
        });
    }
});

// Get all users (for testing/admin purposes)
app.get('/api/users', (req, res) => {
    db.all('SELECT id, full_name, email, created_at, last_login FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        res.json({
            success: true,
            users: rows
        });
    });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;

    db.get(
        'SELECT id, full_name, email, created_at, last_login FROM users WHERE id = ?',
        [id],
        (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                user: user
            });
        }
    );
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
