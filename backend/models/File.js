const mongoose = require("mongoose");
const fileMetadataSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true }, // Store in bytes
    uploadDate: { type: Date, default: Date.now },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference User
    uploadedByEmail: { type: String, required: true }, // Save the email
  },
  { timestamps: true }
);

const FileMetadata =
  mongoose.models.FileMetadata || mongoose.model("File_Metadata", fileMetadataSchema);

module.exports = FileMetadata;
