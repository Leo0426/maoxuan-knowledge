export type ArticleSummary = {
  id: number;
  title: string;
  volume?: string | null;
  period?: string | null;
};

export type Article = {
  id: number;
  title: string;
  volume?: string | null;
  period?: string | null;
  date_text?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  source?: string | null;
  content: string;
};

export type Event = {
  id: number;
  article_id: number;
  title: string;
  description: string;
  date_text?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  importance: number;
  quote?: string | null;
};

export type Idea = {
  id: number;
  article_id: number;
  name: string;
  summary: string;
  category?: string | null;
  quote?: string | null;
};

export type Entity = {
  id: number;
  name: string;
  type: string;
  description?: string | null;
};

export type GraphNode = {
  id: string;
  name: string;
  type: string;
  raw_id: number;
  category: number;
};

export type GraphEdge = {
  source: string;
  target: string;
  relation_type: string;
};

export type SearchResults = {
  articles: Article[];
  events: Event[];
  ideas: Idea[];
  entities: Entity[];
};

export type MapLocation = {
  id: string;
  name: string;
  province: string;
  longitude: number;
  latitude: number;
  event_count: number;
  start_date?: string | null;
  end_date?: string | null;
  events: Event[];
};
