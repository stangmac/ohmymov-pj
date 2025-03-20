const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    movie_id: { type: Number, required: true },

    box_office: {
        budget: { type: String, default: "Unknown" },
        revenue: { type: String, default: "Unknown" }
    },

    cast: [{
        national_name: { type: String },
        character: { type: String }
    }],

    crew: [{
        role: { type: String, required: true },
        members: [{ type: String, required: true }]
    }],

    dislike: { type: Number, default: 0 },
    dubbing_languages: [{ type: String }],
    duration_minute: { type: Number, required: true },
    genres: [{ type: String }],
    keywords: [{ type: String }],
    language: { type: String, default: "Unknown" },
    like: { type: Number, default: 0 },
    popularity_score: { type: Number, default: 0 },

    poster_url: [{ type: String }],

    rating_imdb: { type: String, default: "N/A" },
    rating_rotten: { type: String, default: "N/A" },

    release_date: { type: String, required: true },
    review_count: { type: Number, default: 0 },
    subtitle_languages: [{ type: String }],
    
    synopsis: { type: String, required: true },
    teaser_url: { type: String, default: "No trailer available" },

    title: { type: String, required: true },
    watch: [{ type: String, default: "Not available" }],
    watch_count: { type: Number, default: 0 },
    year: { type: String, required: true },

    // ✅ เพิ่มฟิลด์ recommendations
    recommendations: [{
        movie_id: { type: Number, required: true },
        title: { type: String, required: true },
        similarity: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('Movie', movieSchema, 'movie');