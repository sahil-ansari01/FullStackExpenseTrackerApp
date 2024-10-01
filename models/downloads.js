// models/download.js
const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  fileURL: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Download', downloadSchema);