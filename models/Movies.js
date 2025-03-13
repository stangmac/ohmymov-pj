const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    _id: { type: Number, required: true },

    cast: [{
        national_name: { type: String, required: true },
        character: { type: String, required: true }
    }],

    crew: [{
        role: { type: String, required: true },
        members: [{ type: String, required: true }]
    }],

    duration_minute: { type: Number, required: true }, 
    genres: [{ type: String, required: true }], 

    rating_imdb: { type: String, required: true }, 
    rating_rotten: { type: String, required: true },

    synopsis: { type: String, required: true },

    teaser_url: { type: String }, // ✅ เปลี่ยนจาก Array เป็น String

    poster_url: [{ type: String }], 

    title: { type: String, required: true },
    watch_platforms: [{ type: String, required: true }],
    year: { type: String, required: true },

    like: { type: Number, default: 0 }
});

module.exports = mongoose.model('Movie', movieSchema, 'movie');
