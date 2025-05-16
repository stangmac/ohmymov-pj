const Post = require('../models/Post');
const Movie = require('../models/Movies');
const User = require('../models/User');

exports.listPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ created_at: -1 })
      .populate('movie_id', 'title')
      .populate('user_id', 'username');

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
    const { movie_id, text } = req.body;
    const user_id = req.session?.user?._id || '681862828bd709566feaba5e'; // mock

    await Post.create({ user_id, movie_id, text });
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
