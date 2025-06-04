#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Setting up Crefy Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    // Generate a random JWT secret
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    
    const envContent = `# Database Configuration
MONGO_URI=mongodb://localhost:27017/crefy-mems

# JWT Configuration
JWT_SECRET=${jwtSecret}

# Server Configuration
PORT=5000

# Cloudinary Configuration (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created with secure JWT secret');
} else {
    console.log('✅ .env file already exists');
}

console.log('\n📋 Setup complete! Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Run: npm install (if not already done)');
console.log('3. Run: npm run dev');
console.log('\n🔧 If you need to modify database settings, edit the .env file');
