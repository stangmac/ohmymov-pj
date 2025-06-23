// __tests__/postController.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./app');  // ✅ ชี้ไปที่ app.js ที่ Export Express app
const Post = require('./models/Post');
const Movie = require('./models/Movies');
const User = require('./models/User');

let mongoServer;
let userId, movieId, postId;

beforeAll(async () => {
  // เริ่ม MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // เชื่อมต่อ MongoDB
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // สร้าง User ตัวอย่าง
  const user = await User.create({
    username: 'testuser',
    password: '1234',
    email: 'test@example.com',
    gender: 'male',
    date: new Date(),
  });
  userId = user._id;

  // สร้าง Movie ตัวอย่าง
  const movie = await Movie.create({
    _id: new mongoose.Types.ObjectId(),
    title: 'Test Movie',
    movie_id: 999999,
    synopsis: 'This is a test synopsis.',
    release_date: '2020-01-01',
    year: '2020',
  });

  movieId = movie._id;

  // สร้าง Post ตัวอย่าง พร้อมใส่ user id (สำคัญ)
  const post = await Post.create({
    user: userId,
    content: 'This is an initial test post',
    tagged_movies: [movieId],
  });
  postId = post._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('🎬 Post Feature Test Suite', () => {
  it('1️⃣ ผู้ใช้สร้างโพสต์ใหม่ (review)', async () => {
    const newPostContent = 'This is a great movie!';
    const res = await request(app)
      .post('/posts/create') // ✅ แก้ไข URL ให้ตรงกับ router ใน services/postRoute.js
      .set('x-user-id', userId.toString())
      .send({
        tagged_movies: [movieId.toString()],
        content: newPostContent,
      });

    expect(res.statusCode).toBe(302); // คาดว่าจะ redirect หลังสร้างโพสต์

    // ตรวจสอบโพสต์ใน DB ว่าถูกสร้างหรือไม่
    const post = await Post.findOne({ content: newPostContent });
    expect(post).toBeTruthy();
    expect(post.content).toBe(newPostContent);
    expect(post.user.toString()).toBe(userId.toString());

    postId = post._id; // เก็บไว้ใช้ทดสอบข้อต่อไป
  });

  it('2️⃣ ผู้ใช้อื่นเข้าดูกระทู้', async () => {
    const res = await request(app).get('/posts');

    expect(res.statusCode).toBe(200);
    // เนื่องจาก postController.js render เป็น HTML, เราจะตรวจสอบ text ที่คาดว่าจะอยู่ใน HTML
    expect(res.text).toContain('This is a great movie!'); // ตรวจสอบว่าอ่านได้ถูกต้อง
    expect(res.text).toContain('testuser'); // ตรวจสอบว่ามีชื่อผู้ใช้ปรากฏ
  });

  it('3️⃣ ผู้ใช้คอมเมนต์กระทู้', async () => {
    const commentContent = 'เห็นด้วยเลยครับ';
    const res = await request(app)
      .post(`/posts/comment/${postId}`)
      .set('x-user-id', userId.toString())
      .send({ content: commentContent });

    expect(res.statusCode).toBe(302); // คาดว่าจะ redirect

    // ตรวจสอบว่าคอมเมนต์ถูกเพิ่มเข้าไปในโพสต์
    const post = await Post.findById(postId);
    expect(post.comments.length).toBeGreaterThanOrEqual(1);
    expect(post.comments[0].content).toBe(commentContent);
    expect(post.comments[0].user.toString()).toBe(userId.toString());
  });

  it('4️⃣ ผู้ใช้กดไลค์กระทู้', async () => {
    const res = await request(app)
      .post(`/posts/like/${postId}`)
      .set('x-user-id', userId.toString());

    expect(res.statusCode).toBe(302); // คาดว่าจะ redirect

    // ตรวจสอบว่า user ถูกเพิ่มเข้าใน likes
    const post = await Post.findById(postId);
    expect(post.likes.length).toBe(1);
    expect(post.likes[0].toString()).toBe(userId.toString());
  });
});