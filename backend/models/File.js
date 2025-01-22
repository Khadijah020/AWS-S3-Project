const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadDate: { type: Date, required: true },
  fileKey: { type: String, required: true },
  s3Url: { type: String, required: true },
});

module.exports = mongoose.model('File', fileSchema);