
// ✅ controllers/postController.js
const Post = require('../models/Post');
const Movie = require('../models/Movies');
const User = require('../models/User');

exports.listPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ timestamp: -1 })
      .populate('tagged_movies', 'title')
      .populate('user', 'username');
    res.render('post-list', { posts });
  } catch (err) {
    console.error('❌ Error loading posts:', err);
    res.status(500).send('Server Error');
  }
};

exports.renderPostForm = async (req, res) => {
  try {
    const movies = await Movie.find({}, 'title');
    res.render('post-form', { movies });
  } catch (err) {
    console.error('❌ Error loading form:', err);
    res.status(500).send('Server Error');
  }
};

exports.createPost = async (req, res) => {
  try {
    const { tagged_movies, content } = req.body;
    const user = req.session?.user?._id || '681862828bd709566feaba5e';
    await Post.create({
      user,
      content,
      tagged_movies: Array.isArray(tagged_movies) ? tagged_movies : [tagged_movies]
    });
    res.redirect('/posts');
  } catch (err) {
    console.error('❌ Error creating post:', err);
    res.status(500).send('Server Error');
  }
};

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session?.user?._id || '681862828bd709566feaba5e';
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: userId }
    });
    res.redirect('/posts');
  } catch (err) {
    console.error('❌ Error liking post:', err);
    res.status(500).send('Like Failed');
  }
};