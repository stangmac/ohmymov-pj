const Movie = require('../models/Movies');
const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.user?.id;
    const user = await User.findById(userId);

    const selectedGenres = user.favoriteGenres || [];
    const moviesByGenre = {};

    for (const genre of selectedGenres) {
      const movies = await Movie.aggregate([
        { 
          $match: { 
            genres: genre, 
            rating_imdb: { $ne: "N/A" } // ไม่เอาคะแนนที่ไม่มี
          } 
        },
        { 
          $addFields: { 
            numericRating: { $toDouble: "$rating_imdb" } // แปลงคะแนนเป็นตัวเลข
          } 
        },
        { 
          $sort: { numericRating: -1 } // เรียงจากมากไปน้อย
        },
        { 
          $limit: 5 // เอาแค่ 5 เรื่อง
        }
      ]);

      moviesByGenre[genre] = movies;
    }

    // สร้างข้อมูลพฤติกรรมผู้ใช้
    const userBehavior = {
      like: user.like.map(id => id.toString()),
      dislike: user.dislike.map(id => id.toString()),
      wishlist: user.wishlist.map(id => id.toString()),
      seen: user.seen.map(id => id.toString())
    };

    res.render('movie-preference', {
      selectedGenres,
      moviesByGenre,
      userBehavior
    });

  } catch (error) {
    console.error("❌ Error rendering movie-preference:", error);
    res.status(500).send("Server Error");
  }
};
