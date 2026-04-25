from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ArticleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    volume: Optional[str] = None
    period: Optional[str] = None
    date_text: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    source: Optional[str] = None
    content: str
    created_at: datetime
    updated_at: datetime


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    article_id: int
    title: str
    description: str
    date_text: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    importance: int
    quote: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class IdeaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    article_id: int
    name: str
    summary: str
    category: Optional[str] = None
    quote: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class EntityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class GraphNode(BaseModel):
    id: str
    name: str
    type: str
    raw_id: int
    category: int


class GraphEdge(BaseModel):
    source: str
    target: str
    relation_type: str


class GraphRead(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class SearchResults(BaseModel):
    articles: list[ArticleRead]
    events: list[EventRead]
    ideas: list[IdeaRead]
    entities: list[EntityRead]


class ArticleSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    volume: Optional[str] = None
    period: Optional[str] = None


class BookArticleSummary(BaseModel):
    id: int
    slug: str
    title: str


class BookArticleDetail(BaseModel):
    id: int
    slug: str
    title: str
    content: str


class MapLocation(BaseModel):
    id: str
    name: str
    province: str
    longitude: float
    latitude: float
    event_count: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    events: list[EventRead]
