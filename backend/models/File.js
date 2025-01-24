const mongoose = require("mongoose");

const fileMetadataSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true }, // Store in bytes
    uploadDate: { type: Date, default: Date.now },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Use existing model if it exists, otherwise create a new one
const FileMetadata =
  mongoose.models.FileMetadata || mongoose.model("File_Metadata", fileMetadataSchema);

module.exports = FileMetadata;
