const mongoose = require("mongoose");
const fileMetadataSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true }, 
    uploadDate: { type: Date, default: Date.now },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedByEmail: { type: String, required: true }, 
  },
  { timestamps: true }
);

const FileMetadata =
  mongoose.models.FileMetadata || mongoose.model("File_Metadata", fileMetadataSchema);

module.exports = FileMetadata;
