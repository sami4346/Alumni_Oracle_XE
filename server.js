const express = require('express'); // Importing the Express framework for building web applications
const oracledb = require('oracledb'); // Importing OracleDB for database interactions
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const bcrypt = require('bcryptjs'); // Library for hashing passwords. Not needed now
const path = require('path'); // Module for handling file and directory paths

// Initialize OracleDB client
oracledb.initOracleClient({ libDir: 'C:\\instantclient_11_2' }); // Specify the directory for Oracle client libraries

const app = express(); // Create an Express application
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// Database configuration
const dbConfig = {
    user: 'alumni_admin', // Database username
    password: 'admin', // Database password
    connectString: 'Sami:1521/XE' // Connection string for the database
};

// Registration API
app.post('/api/signup', async (req, res) => {
    const { fullName, batch, department, phoneNumber, email, jobTitle, place } = req.body; // Destructure request body

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig); // Establish a connection to the database
        const userId = `A${Math.floor(100000 + Math.random() * 900000)}`; // Generate a random Alumni ID

        // Insert new alumni record into the database
        await connection.execute(
            `INSERT INTO Alumni (alumni_id, full_name, batch, department, phone_number, email, job_title, place) 
             VALUES (:userId, :fullName, :batch, :department, :phoneNumber, :email, :jobTitle, :place)`,
            [userId, fullName, batch, department, phoneNumber, email, jobTitle, place],
            { autoCommit: true } // Automatically commit the transaction
        );

        // Send response with user ID and redirect URL
        res.send({
            userId,
            redirectUrl: `/alumniProfile.html?userId=${userId}`
        });

    } catch (err) {
        console.error('Error during signup:', err); // Log error
        res.status(500).send('Internal Server Error'); // Send error response
    } finally {
        if (connection) await connection.close(); // Close the database connection
    }
});

// Profile API
app.get('/api/profile', async (req, res) => {
    const { userId } = req.query; // Get user ID from query parameters

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig); // Establish a connection to the database
        const result = await connection.execute(
            `SELECT full_name, batch, department, phone_number, email, job_title, place 
             FROM Alumni 
             WHERE alumni_id = :userId`,
            [userId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Format the output as an object
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Alumni not found.'); // Handle case where alumni is not found
        }

        const alumni = result.rows[0]; // Get the first result
        res.send({
            fullName: alumni.FULL_NAME,
            batch: alumni.BATCH,
            department: alumni.DEPARTMENT,
            phoneNumber: alumni.PHONE_NUMBER,
            email: alumni.EMAIL,
            jobTitle: alumni.JOB_TITLE,
            place: alumni.PLACE,
        });
    } catch (err) {
        console.error('Error fetching profile:', err); // Log error
        res.status(500).send('Internal Server Error'); // Send error response
    } finally {
        if (connection) await connection.close(); // Close the database connection
    }
});

// Alumni List API
app.get('/api/alumni', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig); // Establish a connection to the database
        const result = await connection.execute(
            `SELECT full_name, batch, department, phone_number, email, job_title, place 
             FROM Alumni 
             ORDER BY batch`, // Order results by batch
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Format the output as an object
        );

        res.send(result.rows); // Send the list of alumni
    } catch (err) {
        console.error('Error fetching alumni list:', err); // Log error
        res.status(500).send('Internal Server Error'); // Send error response
    } finally {
        if (connection) await connection.close(); // Close the database connection
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000'); // Log server start message
});
