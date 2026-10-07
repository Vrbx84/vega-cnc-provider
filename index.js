/**
 * Vega App Provider Plugin
 */

const BASE_URL = "https://api.consumet.org/movies/flixhq";

const provider = {
  // 1. Search Query
  async search(query) {
    try {
      const response = await fetch(`${BASE_URL}/${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.id,
        poster: item.image,
        type: item.type === "Movie" ? "movie" : "series",
        releaseDate: item.releaseDate || ""
      }));
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  },

  // 2. Details & Episode List
  async getDetails(id) {
    try {
      const response = await fetch(`${BASE_URL}/info?id=${encodeURIComponent(id)}`);
      const data = await response.json();

      let episodes = [];
      if (data.episodes && Array.isArray(data.episodes)) {
        episodes = data.episodes.map((ep) => ({
          id: ep.id,
          title: ep.title || `Episode ${ep.number}`,
          seasonNumber: ep.season || 1,
          episodeNumber: ep.number || 1
        }));
      }

      return {
        id: data.id,
        title: data.title,
        poster: data.image,
        description: data.description || "",
        genres: data.genres || [],
        type: data.type === "Movie" ? "movie" : "series",
        episodes: episodes
      };
    } catch (error) {
      console.error("Get details failed:", error);
      throw error;
    }
  },

  // 3. Extract Video Stream URLs (.m3u8 / .mp4)
  async getStreamUrls(episodeId, mediaId) {
    try {
      // Episode watch URL se stream servers fetch karna
      const url = `${BASE_URL}/watch?episodeId=${encodeURIComponent(episodeId)}&mediaId=${encodeURIComponent(mediaId)}`;
      const response = await fetch(url);
      const data = await response.json();

      const streams = [];

      // Video sources map karna (HLS / MP4)
      if (data.sources && Array.isArray(data.sources)) {
        data.sources.forEach((src) => {
          streams.push({
            url: src.url,
            quality: src.quality || "auto",
            isHls: src.isM3U8 || src.url.includes(".m3u8"),
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Referer": "https://flixhq.to/"
            }
          });
        });
      }

      // Subtitles parse karna
      const subtitles = [];
      if (data.subtitles && Array.isArray(data.subtitles)) {
        data.subtitles.forEach((sub) => {
          subtitles.push({
            url: sub.url,
            language: sub.lang || "English"
          });
        });
      }

      return {
        streams,
        subtitles
      };
    } catch (error) {
      console.error("Get stream failed:", error);
      return { streams: [], subtitles: [] };
    }
  }
};

// Vega module export
export default provider;
