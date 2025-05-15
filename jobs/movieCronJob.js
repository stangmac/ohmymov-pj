import cron from 'node-cron';
import { syncMovies } from '../services/movieSyncService.js';

export function scheduleMovieSync() {
  cron.schedule('39 18 * * *', async () => {
    console.log('🕓 Running scheduled movie sync at 18:12...');
    try {
      await syncMovies();
      console.log('Movie sync completed successfully');
    } catch (err) {
      console.error('Movie sync failed:', err.message);
    }
  });
}
