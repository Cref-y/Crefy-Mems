require('dotenv').config();

// Validate JWT secret
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET environment variable is required');
    console.log('Please create a .env file with JWT_SECRET=your-secret-key');
    process.exit(1);
}

module.exports = {
    JWT_CONFIG: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
    }
};