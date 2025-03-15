const UserActivity = require('../models/UserActivity');

// Function to log user activity
exports.logActivity = async (req, res, action) => {
  try {
    const userActivity = new UserActivity({
      userId: req.user._id, // Assuming user is authenticated
      movieId: req.params.movieId, // Movie ID from URL params
      action: action // Action type (like view_movie, watch_trailer, etc.)
    });
    await userActivity.save();
    res.status(200).send({ success: true, message: 'Activity logged successfully' });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error logging activity', error });
  }
};
