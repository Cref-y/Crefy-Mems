const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    wallet_address: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: v => /^0x[a-fA-F0-9]{40}$/.test(v),
            message: 'Invalid wallet address'
        }
    },
    created_at: { type: Date, default: Date.now },
    username: { type: String }
});

module.exports = mongoose.model('User', UserSchema);