from __future__ import annotations

from typing import Optional

from sqlmodel import Session, col, or_, select

from app.models import Article, Entity, Event, Idea, Relation


def list_articles(session: Session, limit: int = 50, offset: int = 0) -> list[Article]:
    return list(session.exec(select(Article).offset(offset).limit(limit)).all())


def get_article(session: Session, article_id: int) -> Optional[Article]:
    return session.get(Article, article_id)


def list_events(
    session: Session,
    limit: int = 100,
    offset: int = 0,
    sort: Optional[str] = None,
    article_id: Optional[int] = None,
) -> list[Event]:
    statement = select(Event)
    if article_id is not None:
        statement = statement.where(Event.article_id == article_id)
    if sort == "start_date":
        statement = statement.order_by(col(Event.start_date).is_(None), Event.start_date)
    return list(session.exec(statement.offset(offset).limit(limit)).all())


def get_event(session: Session, event_id: int) -> Optional[Event]:
    return session.get(Event, event_id)


def list_ideas(
    session: Session,
    limit: int = 100,
    offset: int = 0,
    article_id: Optional[int] = None,
) -> list[Idea]:
    statement = select(Idea)
    if article_id is not None:
        statement = statement.where(Idea.article_id == article_id)
    return list(session.exec(statement.offset(offset).limit(limit)).all())


def list_entities(session: Session, limit: int = 100, offset: int = 0) -> list[Entity]:
    return list(session.exec(select(Entity).offset(offset).limit(limit)).all())


def list_relations(session: Session, limit: int = 500, offset: int = 0) -> list[Relation]:
    return list(session.exec(select(Relation).offset(offset).limit(limit)).all())


def search_all(session: Session, q: str, limit: int = 20) -> dict[str, list]:
    term = f"%{q.strip()}%"
    if not q.strip():
        return {"articles": [], "events": [], "ideas": [], "entities": []}

    articles = session.exec(
        select(Article)
        .where(or_(Article.title.ilike(term), Article.content.ilike(term)))
        .limit(limit)
    ).all()
    events = session.exec(select(Event).where(Event.title.ilike(term)).limit(limit)).all()
    ideas = session.exec(select(Idea).where(Idea.name.ilike(term)).limit(limit)).all()
    entities = session.exec(select(Entity).where(Entity.name.ilike(term)).limit(limit)).all()
    return {
        "articles": list(articles),
        "events": list(events),
        "ideas": list(ideas),
        "entities": list(entities),
    }
