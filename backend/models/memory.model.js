const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
    creator_wallet: {
        type: String,
        required: true,
        ref: 'User'
    },
    title: { type: String, required: true },
    description: { type: String },
    qr_code: { type: String, required: false, unique: true },
    image_url: { type: String },
    is_redeemable: { type: Boolean, default: true },
    max_mints: { type: Number, default: 1 },
    current_mints: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Memory', MemorySchema);