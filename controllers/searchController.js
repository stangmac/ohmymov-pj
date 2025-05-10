const client = require('../services/elasticsearch');

// 🔍 ใช้สำหรับ autocomplete / fetch แบบ JSON
async function searchMovies(req, res) {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'กรุณาใส่คำค้นหา' });

    try {
        const { hits, max_score } = await client.search({
            index: 'movie',
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: [
                            'title^6',
                            'original_title^4',
                            'genres^3',
                            'keywords^3',
                            'synopsis^1',
                            'cast.national_name^2',
                            'cast.aka_names^1.5',
                            'crew.members^1',
                            'year^0.5'
                        ],
                        fuzziness: 'AUTO'
                    }
                }
            }
        });

        const movies = hits.hits.map(hit => {
            const percent = max_score && hit._score ? ((hit._score / max_score) * 100).toFixed(0) : 0;
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
                matchPercent: `${percent}%`,
                watch: hit._source.watch || [],
                rating_imdb: hit._source.rating_imdb || "N/A",
                rating_rotten: hit._source.rating_rotten || "N/A"
            };
        });

        res.json({ results: movies });

    } catch (error) {
        console.error('❌ Error searching movies:', error);
        res.status(500).json({ error: error.message });
    }
}

// 🌐 ใช้สำหรับแสดงหน้า result-search
async function renderSearchPage(req, res) {
    const query = req.query.query;
    if (!query) return res.render('result-search', { query: '', results: [] });

    try {
        const response = await client.search({
            index: 'movie',
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: [
                            'title^6',
                            'original_title^4',
                            'genres^3',
                            'keywords^3',
                            'synopsis^1',
                            'cast.national_name^2',
                            'cast.aka_names^1.5',
                            'crew.members^1',
                            'year^0.5'
                        ],
                        fuzziness: 'AUTO'
                    }
                }
            }
        });

        const hits = response.hits.hits;
        const max_score = response.hits.max_score;

        const results = hits.map(hit => {
            const percent = max_score && hit._score ? ((hit._score / max_score) * 100).toFixed(0) : 0;
            return {
                id: hit._id,
                title: hit._source.title,
                genres: hit._source.genres,
                year: hit._source.year,
                poster_url: hit._source.poster_url || '/images/default-movie.png',
                matchPercent: `${percent}%`,
                watch: hit._source.watch || [],
                rating_imdb: hit._source.rating_imdb || "N/A",
                rating_rotten: hit._source.rating_rotten || "N/A"
            };
        }); 
        console.log("🎯 Sample movie:", results[0]);
        console.log("🔍 max_score:", max_score);
        hits.slice(0, 5).forEach((hit, i) => {
            console.log(`🎯 hit[${i}].score:`, hit._score);
        });

        res.render('result-search', {
            query,
            results,
            loggedIN: req.session?.user?.username || null
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
