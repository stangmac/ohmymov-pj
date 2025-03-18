const mongoose = require('mongoose');
const User = require('../models/User'); // โมเดล User ที่ใช้เก็บข้อมูลผู้ใช้

async function logUserActivity(req, res) {
  try {
    const userId = req.session.user.id; // ดึง ID ของผู้ใช้จาก session
    const { movieId, action } = req.body; // ดึง movieId และ action จาก body ของคำขอ

    // แปลง movieId จาก string เป็น ObjectId
    const objectId = new mongoose.Types.ObjectId(movieId); // แก้ไขการสร้าง ObjectId

    const user = await User.findById(userId); // ค้นหาผู้ใช้ในฐานข้อมูล

    console.log("User before update:", user);

    // ตรวจสอบ action และอัพเดตข้อมูลพฤติกรรมการใช้งาน
    if (action === 'like') {
      // หาก movieId อยู่ใน dislike หรือ wishlist หรือ seen ให้ลบออกก่อน
      user.dislike = user.dislike.filter(id => !id.equals(objectId));
      user.wishlist = user.wishlist.filter(id => !id.equals(objectId));
      user.seen = user.seen.filter(id => !id.equals(objectId));

      if (!user.like.includes(objectId)) {
        user.like.push(objectId);
      }
    } else if (action === 'dislike') {
      // หาก movieId อยู่ใน like หรือ wishlist หรือ seen ให้ลบออกก่อน
      user.like = user.like.filter(id => !id.equals(objectId));
      user.wishlist = user.wishlist.filter(id => !id.equals(objectId));
      user.seen = user.seen.filter(id => !id.equals(objectId));

      if (!user.dislike.includes(objectId)) {
        user.dislike.push(objectId);
      }
    } else if (action === 'wishlist') {
      // หาก movieId อยู่ใน like หรือ dislike หรือ seen ให้ลบออกก่อน
      user.like = user.like.filter(id => !id.equals(objectId));
      user.dislike = user.dislike.filter(id => !id.equals(objectId));
      user.seen = user.seen.filter(id => !id.equals(objectId));

      // หาก movieId อยู่ใน wishlist และต้องการ "unwishlist" ให้ลบออก
      if (user.wishlist.includes(objectId)) {
        user.wishlist = user.wishlist.filter(id => !id.equals(objectId));
      } else {
        // หากไม่พบใน wishlist ให้เพิ่มเข้าไป
        user.wishlist.push(objectId);
      }
    } else if (action === 'seen') {
      // หาก movieId อยู่ใน like หรือ dislike หรือ wishlist ให้ลบออกก่อน
      user.like = user.like.filter(id => !id.equals(objectId));
      user.dislike = user.dislike.filter(id => !id.equals(objectId));
      user.wishlist = user.wishlist.filter(id => !id.equals(objectId));

      // หาก movieId อยู่ใน seen และต้องการ "unseen" ให้ลบออก
      if (user.seen.includes(objectId)) {
        user.seen = user.seen.filter(id => !id.equals(objectId));
      } else {
        // หากไม่พบใน seen ให้เพิ่มเข้าไป
        user.seen.push(objectId);
      }
    }

    // บันทึกข้อมูลการอัพเดต
    await user.save();

    // เพิ่มการตรวจสอบว่าการบันทึกเสร็จสมบูรณ์
    console.log("User after update:", user);

    // ส่งข้อมูลการตอบสนองกลับไป
    res.json({ success: true, action, movieId, updatedData: user[action] });
  } catch (error) {
    console.error("Error logging user activity:", error);
    res.status(500).json({ success: false, message: "Failed to log user activity" });
  }
}

module.exports = { logUserActivity };
