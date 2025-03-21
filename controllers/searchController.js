const client = require('../services/elasticsearch'); // นำเข้า Elasticsearch Client

// ฟังก์ชันสำหรับค้นหาหนัง
async function searchMovies(req, res) {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'กรุณาใส่คำค้นหา' });
    }

    try {
        const { hits } = await client.search({
            index: 'movie', // ใช้ Index "movie" ให้ตรงกับ MongoDB
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: [
                            'title',
                            'genres',
                            'synopsis',
                            'keywords',
                            'cast',
                            'crew',
                            'year'
                        ],
                        fuzziness: 'AUTO' // รองรับการสะกดผิดเล็กน้อย55
                    }
                }
            }
        });

        // ดึงเฉพาะข้อมูลที่จำเป็นจาก Elasticsearch
        const movies = hits.hits.map(hit => ({
            id: hit._id,
            title: hit._source.title,
            genres: hit._source.genres,
            synopsis: hit._source.synopsis,
            keywords: hit._source.keywords,
            cast: hit._source.cast,
            crew: hit._source.crew,
            year: hit._source.year,
            release_date: hit._source.release_date,
            popularity_score: hit._source.popularity_score,
            watch_count: hit._source.watch_count,
            // ✅ ส่ง poster_url ออกมาด้วย
            poster_url: hit._source.poster_url || '/images/default-movie.png'
        }));

        res.json({ results: movies });
    } catch (error) {
        console.error('❌ Error searching movies:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { searchMovies };
