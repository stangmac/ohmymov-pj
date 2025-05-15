const axios = require('axios');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const pLimit = require('p-limit');

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY || '563a9165e7310fa18aac199ec2573790';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://stang:Satang13@cluster0.tah8c.mongodb.net/ohmymov';
const OMDB_API_KEY = process.env.OMDB_API_KEY || '113fd400';

const limit = pLimit(4);
const client = new MongoClient(MONGO_URI);
let moviesCollection;

async function connectDB() {
  if (!moviesCollection) {
    await client.connect();
    const db = client.db('ohmymov');
    moviesCollection = db.collection('movie');
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, maxRetries = 5, delayMs = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        const jitter = Math.random() * 500;
        const nextDelay = delayMs * Math.pow(2, attempt) + jitter;
        console.warn(`⚠️ Rate limit hit. Retrying in ${(nextDelay / 1000).toFixed(1)}s...`);
        await delay(nextDelay);
      } else {
        console.error(`❌ Error fetching URL: ${url} - ${error.message}`);
        return null;
      }
    }
  }
}

async function fetchWithLimitedConcurrency(urls) {
  const results = await Promise.all(
    urls.map(url => limit(() => fetchWithRetry(url)))
  );
  return results;
}

async function fetchRatings(title) {
  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
  const response = await fetchWithRetry(url);
  if (!response || response.data.Response === "False") {
    return { imdbRating: 'N/A', rottenRating: 'N/A' };
  }
  return {
    imdbRating: response.data.imdbRating || 'N/A',
    rottenRating: response.data.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value || 'N/A'
  };
}

async function fetchActorAliases(personId) {
  const url = `https://api.themoviedb.org/3/person/${personId}?api_key=${TMDB_API_KEY}`;
  const response = await fetchWithRetry(url);
  return response ? response.data.also_known_as || [] : [];
}

async function fetchMovieData(movieId) {
  try {
    await delay(250);

    const existingMovie = await moviesCollection.findOne({ movie_id: movieId });

    const urls = [
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`,
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`,
      `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${TMDB_API_KEY}`,
      `https://api.themoviedb.org/3/movie/${movieId}/keywords?api_key=${TMDB_API_KEY}`
    ];

    const [movieResponse, watchProvidersResponse, imagesResponse, keywordsResponse] = await fetchWithLimitedConcurrency(urls);

    if (!movieResponse) return null;
    const data = movieResponse.data;

    const { imdbRating, rottenRating } = await fetchRatings(data.title);
    const popularity_score = data.popularity || 0;
    const watch_count = data.vote_count > 0 ? data.vote_count : "Unknown";
    const release_date = data.release_date ? new Date(data.release_date).toLocaleDateString('en-GB') : 'Unknown';

    const watchProvidersData = watchProvidersResponse?.data?.results || {};
    const filterProviders = ['Netflix', 'Hotstar', 'Amazon Prime Video', 'Apple TV', 'Max', 'TrueID', 'Viu', 'HBO Go', 'Google Play Movies'];

    const providers = [
      ...(Object.values(watchProvidersData?.US || {}).flat() || []),
      ...(Object.values(watchProvidersData?.TH || {}).flat() || [])
    ];
    const watchProviders = [...new Set(providers.map(provider => provider.provider_name).filter(name => filterProviders.includes(name)))];

    const posterUrls = imagesResponse?.data?.posters?.slice(0, 5).map(poster =>
      `https://image.tmdb.org/t/p/w500${poster.file_path}`) || [];

    const teaserKey = data.videos?.results?.find(video => video.type === 'Trailer')?.key;
    const teaserUrl = teaserKey
      ? `https://www.youtube.com/watch?v=${teaserKey}`
      : 'No trailer available';

    const castPromises = data.credits?.cast?.slice(0, 10).map(async actor => {
      const akaNames = await fetchActorAliases(actor.id);
      return {
        national_name: actor.name,
        character: actor.character,
        aka_names: akaNames.length > 0 ? akaNames : ["No known aliases"]
      };
    }) || [];

    const cast = await Promise.all(castPromises);

    const crew = data.credits?.crew?.reduce((acc, member) => {
      const existingRole = acc.find(entry => entry.role === member.job);
      if (existingRole) {
        existingRole.members.push(member.name);
      } else {
        acc.push({ role: member.job, members: [member.name] });
      }
      return acc;
    }, []) || [];

    const keywords = keywordsResponse?.data?.keywords?.map(k => k.name) || [];

    return {
      movie_id: movieId,
      title: data.title,
      year: data.release_date?.split('-')[0] || 'Unknown',
      release_date,
      genres: data.genres.map(genre => genre.name),
      duration_minute: data.runtime || 'Unknown',
      rating_imdb: imdbRating,
      rating_rotten: rottenRating,
      synopsis: data.overview || 'No synopsis available',
      watch: watchProviders.length > 0 ? watchProviders : ['Not available'],
      teaser_url: teaserUrl,
      poster_url: posterUrls.length > 0 ? posterUrls : ['No posters available'],
      cast,
      crew,
      keywords,
      popularity_score,
      watch_count,
      review_count: 0,
      like: existingMovie?.like || 0,
      dislike: existingMovie?.dislike || 0
    };
  } catch (error) {
    console.error(`❌ Error fetching movie data for ID ${movieId}: ${error.message}`);
    return null;
  }
}


// 👇 ใส่ไว้ก่อน syncMovies()
const { exec } = require('child_process');

// ฟังก์ชันนี้มีอยู่แล้วในไฟล์คุณ ให้เพิ่มในนี้เลย
async function runElasticSync() {
  exec('node scripts/deleteAndSyncMovies.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Failed to sync with Elasticsearch: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`❗ Elasticsearch sync stderr: ${stderr}`);
    }
    console.log(`📡 Elasticsearch sync output:\n${stdout}`);

    // ✅ เรียก Python script ต่อเลย
    exec('python scripts/generateRecommendations.py', (err, out, errOut) => {
      if (err) {
        console.error(`❌ Failed to generate recommendations: ${err.message}`);
        return;
      }
      if (errOut) {
        console.error(`⚠️ Recommendation script stderr: ${errOut}`);
      }
      console.log(`✅ Recommendations generated:\n${out}`);
    });
  });
}




async function syncMovies(movieCount = 10000) {
  await connectDB();

  const pagesToFetch = Math.ceil(movieCount / 20);
  const allMovies = [];

  for (let page = 1; page <= pagesToFetch; page++) {
    const url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
    const response = await fetchWithRetry(url);
    const filtered = response?.data?.results?.filter(m =>
      new Date(m.release_date) > new Date("2017-01-01")) || [];
    allMovies.push(...filtered);
  }

  const existingMovieIdsSet = new Set(
    (await moviesCollection.find({}, { projection: { movie_id: 1 } }).toArray())
      .map(doc => doc.movie_id)
  );

  const newMovies = allMovies.filter(movie => !existingMovieIdsSet.has(movie.id));
  console.log(`📦 ${newMovies.length} new movies to insert`);

  const chunkSize = 500;
  for (let i = 0; i < newMovies.length; i += chunkSize) {
    const chunk = newMovies.slice(i, i + chunkSize);
    const movieDetails = await Promise.all(chunk.map(movie => fetchMovieData(movie.id)));
    const validMovies = movieDetails.filter(m => m !== null);

    if (validMovies.length > 0) {
      const ops = validMovies.map(movie => ({
        updateOne: {
          filter: { movie_id: movie.movie_id },
          update: { $set: movie },
          upsert: true
        }
      }));
      await moviesCollection.bulkWrite(ops);
    }
  }
  await runElasticSync();
  console.log(`🎉 Synced ${newMovies.length} new movies`);
}

// ✅ Export แบบ CommonJS
module.exports = { syncMovies };


