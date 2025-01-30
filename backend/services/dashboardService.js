const FileMetadata = require('../models/File');
const User = require('../models/User');

const getDashboardStats = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found'); 
    }

    const totalFiles = await FileMetadata.countDocuments({ uploadedBy: user._id });
    const totalStorageUsed = user.storageUsed;
    const mostRecentUpload = await FileMetadata.findOne({ uploadedBy: user._id })
      .sort({ uploadDate: -1 })
      .limit(1);

    return {
      totalFiles,
      totalStorageUsed: (totalStorageUsed).toFixed(2), 
      mostRecentUpload: mostRecentUpload 
        ? {
            fileName: mostRecentUpload.fileName,
            uploadDate: mostRecentUpload.uploadDate,
            fileSize: (mostRecentUpload.fileSize / (1024 * 1024)).toFixed(2)
          }
        : null
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

module.exports = { getDashboardStats };
