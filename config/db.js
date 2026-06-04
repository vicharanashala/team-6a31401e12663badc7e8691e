const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // CONNECTION OPTIONS
        const options = {
            useNewUrlParser : true,
            useUnifiedTopology : true,
            serverSelectionTimeoutMS : 5000,
            socketTimeoutMS : 45000
        };

        // ESTABLISH CONNECTION
        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        console.log('MongoDB connected Successfully');
        console.log(`Host : ${conn.connection.host}`);
        console.log(`Database : ${conn.connection.name}`);
        console.log(`Port : ${conn.connection.port}`);

        // HANDLE CONNECTION ERROR AFTER INTITAL CONNECTION
        mongoose.connection.on('error', (err) => {
            console.error(`Database connection error: ${err.message}`);
        });

        // HANDLE DISCONNECTION
        mongoose.connection.on('disconnected', () => {
            console.log('Database disconnected');
        });

        // HANDLE RECONNECTION
        mongoose.connection.on('reconnected', () => {
            console.log('Database reconnected');
        });

        return conn;
    } catch (error) {
        console.error(`Error connecting to database: ${error.message}`);
        console.error(`Error : ${error.message}`)
        process.exit(1);
    }
};

// GRACEFUL SHUTDOWN HANDLER - ENSURES DATABASE CONNECTION CLOSED BEFORE EXIT
const shutDown = async (signal) => {
    console.log(`\n ${signal} received. Closing Database connection.`);

    try {
        await mongoose.connection.close();
        console.log('Database connection closed successfully');
        process.exit(0);
    } catch (err) {
        console.error(`Error closing Database connection : ${err.message}`);
        process.exit(1);
    }
}

// APP TERMINATION SIGNALS 
process.on('SIGINT', () => shutDown('SIGINT'));
process.on('SIGTERM', () => shutDown('SIGTERM'));
process.on('SIGHUP', () => shutDown('SIGHUP'));

module.exports = connectDB;