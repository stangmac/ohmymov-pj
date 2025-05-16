
// ✅ routes/postRoute.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.listPosts);
router.get('/new', postController.renderPostForm);
router.post('/create', postController.createPost);
router.post('/like/:id', postController.likePost);

module.exports = router;