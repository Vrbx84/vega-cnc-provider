/**
 * Vega Provider Implementation
 * Structure compatible with Vega Provider Interface
 */

const BASE_URL = "https://api.consumet.org/movies/flixhq";

class Provider {
  constructor() {
    this.name = "CNC Movies & Shows";
    this.id = "cnc-movies";
    this.types = ["movie", "tv"];
  }

  // Home Screen / Catalog Items
  async catalog() {
    try {
      const res = await fetch(`${BASE_URL}/trending`);
      const data = await res.json();
      if (!data.results) return [];

      return data.results.map((item) => ({
        id: item.id,
        title: item.title,
        poster: item.image,
        type: item.type === "Movie" ? "movie" : "tv",
        releaseDate: item.releaseDate || ""
      }));
    } catch (e) {
      console.error("Catalog error:", e);
      return [];
    }
  }

  // Search Items
  async search(query) {
    try {
      const res = await fetch(`${BASE_URL}/${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!data.results) return [];

      return data.results.map((item) => ({
        id: item.id,
        title: item.title,
        poster: item.image,
        type: item.type === "Movie" ? "movie" : "tv",
        releaseDate: item.releaseDate || ""
      }));
    } catch (e) {
      console.error("Search error:", e);
      return [];
    }
  }

  // Details Page
  async detail(id) {
    try {
      const res = await fetch(`${BASE_URL}/info?id=${encodeURIComponent(id)}`);
      const data = await res.json();

      const episodes = (data.episodes || []).map((ep) => ({
        id: ep.id,
        title: ep.title || `Episode ${ep.number}`,
        season: ep.season || 1,
        number: ep.number || 1
      }));

      return {
        id: data.id,
        title: data.title,
        poster: data.image,
        description: data.description || "",
        genres: data.genres || [],
        type: data.type === "Movie" ? "movie" : "tv",
        episodes: episodes
      };
    } catch (e) {
      console.error("Detail error:", e);
      return null;
    }
  }

  // Video Stream URLs (.m3u8, .mp4, Subtitles)
  async sources(episodeId, mediaId) {
    try {
      const targetMediaId = mediaId || episodeId;
      const res = await fetch(`${BASE_URL}/watch?episodeId=${encodeURIComponent(episodeId)}&mediaId=${encodeURIComponent(targetMediaId)}`);
      const data = await res.json();

      const streams = (data.sources || []).map((s) => ({
        url: s.url,
        quality: s.quality || "auto",
        isM3U8: s.isM3U8 || s.url.includes(".m3u8"),
        headers: {
          "Referer": "https://flixhq.to/"
        }
      }));

      const subtitles = (data.subtitles || []).map((sub) => ({
        url: sub.url,
        lang: sub.lang || "English"
      }));

      return {
        streams,
        subtitles
      };
    } catch (e) {
      console.error("Sources error:", e);
      return { streams: [], subtitles: [] };
    }
  }
}

// Global instance export for Vega sandbox
const providerInstance = new Provider();
export default providerInstance;
if (typeof module !== "undefined") {
  module.exports = providerInstance;
}
