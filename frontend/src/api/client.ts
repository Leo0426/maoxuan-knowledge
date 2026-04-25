import type {
  Article,
  ArticleSummary,
  Entity,
  Event,
  GraphEdge,
  GraphNode,
  Idea,
  MapLocation,
  SearchResults,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

function qs(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export const api = {
  articleToc: () => getJson<ArticleSummary[]>("/api/articles/toc"),
  articles: () => getJson<Article[]>("/api/articles?limit=300"),
  article: (id: number) => getJson<Article>(`/api/articles/${id}`),

  timeline: (articleId: number) =>
    getJson<Event[]>(`/api/events/timeline${qs({ article_id: articleId })}`),

  graph: (articleId: number) =>
    getJson<{ nodes: GraphNode[]; edges: GraphEdge[] }>(
      `/api/graph${qs({ article_id: articleId })}`,
    ),

  map: (articleId: number, startDate?: string, endDate?: string) =>
    getJson<MapLocation[]>(
      `/api/map${qs({ article_id: articleId, start_date: startDate, end_date: endDate })}`,
    ),

  ideas: () => getJson<Idea[]>("/api/ideas"),
  entities: () => getJson<Entity[]>("/api/entities"),
  search: (q: string) => getJson<SearchResults>(`/api/search?q=${encodeURIComponent(q)}`),
};
