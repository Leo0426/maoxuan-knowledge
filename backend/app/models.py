from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin(SQLModel):
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)


class Article(TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    volume: Optional[str] = None
    period: Optional[str] = None
    date_text: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    source: Optional[str] = None
    content: str


class Event(TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    article_id: int = Field(foreign_key="article.id")
    title: str
    description: str
    date_text: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    importance: int = 3
    quote: Optional[str] = None


class Idea(TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    article_id: int = Field(foreign_key="article.id")
    name: str
    summary: str
    category: Optional[str] = None
    quote: Optional[str] = None


class Entity(TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    description: Optional[str] = None


class Relation(TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source_type: str
    source_id: int
    target_type: str
    target_id: int
    relation_type: str
