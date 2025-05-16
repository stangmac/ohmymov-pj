// ✅ controllers/postController.js - UPDATED with comment + filter
const Post = require('../models/Post');
const Movie = require('../models/Movies');
const User = require('../models/User');

// 📋 แสดงโพสต์ทั้งหมด พร้อม filter ตามหนังที่เลือกได้ผ่าน query
exports.listPosts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.movie) {
      filter.tagged_movies = req.query.movie;
    }

    const posts = await Post.find(filter)
      .sort({ timestamp: -1 })
      .populate('tagged_movies', 'title')
      .populate('user', 'username')
      .populate('comments.user', 'username');

    res.render('post-list', { posts });
  } catch (err) {
    console.error('❌ Error loading posts:', err);
    res.status(500).send('Server Error');
  }
};

// 📝 แสดงฟอร์มเขียนโพสต์
exports.renderPostForm = async (req, res) => {
  try {
    const movies = await Movie.find({}, 'title');
    res.render('post-form', { movies });
  } catch (err) {
    console.error('❌ Error loading form:', err);
    res.status(500).send('Server Error');
  }
};

// ✅ สร้างโพสต์ใหม่
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

// 👍 กดไลก์โพสต์
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

// 💬 คอมเมนต์โพสต์
exports.commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.session?.user?._id || '681862828bd709566feaba5e';
    await Post.findByIdAndUpdate(postId, {
      $push: {
        comments: {
          user: userId,
          content,
          timestamp: new Date()
        }
      }
    });
    res.redirect('/posts');
  } catch (err) {
    console.error('❌ Error commenting:', err);
    res.status(500).send('Comment Failed');
  }
};