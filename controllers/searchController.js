const client = require('../services/elasticsearch'); // นำเข้า Elasticsearch Client

// ฟังก์ชันสำหรับค้นหาหนัง
async function searchMovies(req, res) {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'กรุณาใส่คำค้นหา' });
    }

    try {
        const { hits, max_score } = await client.search({
            index: 'movie',
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: [
                            'title^5',
                            'genres^3',
                            'keywords^2',
                            'synopsis^1',
                            'cast^1',
                            'crew.members^1',
                            'crew.role^0.5',
                            'year^0.5'
                        ],
                        fuzziness: 'AUTO'
                    }
                }
            }
        });

        // ดึงเฉพาะข้อมูลที่จำเป็นจาก Elasticsearch พร้อมเปอร์เซ็นต์ความแม่นยำ
        const movies = hits.hits.map(hit => {
            const percent = max_score ? ((hit._score / max_score) * 100).toFixed(0) : 100;

            return {
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
                poster_url: hit._source.poster_url || '/images/default-movie.png',
                matchPercent: `${percent}%` // ✅ ส่งเปอร์เซ็นต์ความตรง
            };
        });

        res.json({ results: movies });
    } catch (error) {
        console.error('❌ Error searching movies:', error);
        res.status(500).json({ error: error.message });
    }
}


// ต่อจากด้านบน
async function renderSearchPage(req, res) {
    const query = req.query.query;

    if (!query) {
        return res.render('result-search', { query: '', results: [] });
    }

    try {
        const { hits, max_score } = await client.search({
            index: 'movie',
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: [
                            'title^5',
                            'genres^3',
                            'keywords^2',
                            'synopsis^1',
                            'cast^1',
                            'crew.members^1',
                            'crew.role^0.5',
                            'year^0.5'
                        ],
                        fuzziness: 'AUTO'
                    }
                }
            }
        });

        const results = hits.hits.map(hit => {
            const percent = max_score ? ((hit._score / max_score) * 100).toFixed(0) : 100;
            return {
                id: hit._id,
                title: hit._source.title,
                genres: hit._source.genres,
                year: hit._source.year,
                poster_url: hit._source.poster_url || '/images/default-movie.png',
                matchPercent: `${percent}%`
            };
        });

        res.render('result-search', {
            query,
            results,
            loggedIN: req.session?.user.username || null
        });

    } catch (error) {
        console.error('❌ Error rendering search page:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการค้นหา');
    }
}


module.exports = {
    searchMovies,
    renderSearchPage
};
