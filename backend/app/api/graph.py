from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app import crud
from app.database import get_session
from app.models import Article, Event, Idea
from app.schemas import GraphEdge, GraphNode, GraphRead

router = APIRouter(prefix="/api/graph", tags=["graph"])


def node_id(node_type: str, raw_id: int) -> str:
    return f"{node_type}:{raw_id}"


@router.get("", response_model=GraphRead)
def read_graph(
    article_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    if article_id is not None:
        return _article_graph(session, article_id)
    return _full_graph(session)


def _article_graph(session: Session, article_id: int) -> GraphRead:
    """Return nodes and edges scoped to a single article."""
    article = session.get(Article, article_id)
    events = list(session.exec(select(Event).where(Event.article_id == article_id)).all())
    ideas = list(session.exec(select(Idea).where(Idea.article_id == article_id)).all())

    # Primary node IDs that directly belong to this article
    primary_ids: set[str] = set()
    if article:
        primary_ids.add(node_id("article", article_id))
    for ev in events:
        primary_ids.add(node_id("event", ev.id))
    for idea in ideas:
        primary_ids.add(node_id("idea", idea.id))

    # Find relations touching any primary node
    all_relations = crud.list_relations(session, limit=5000)
    relevant_rels = [
        r for r in all_relations
        if node_id(r.source_type, r.source_id) in primary_ids
        or node_id(r.target_type, r.target_id) in primary_ids
    ]

    # Collect entity IDs referenced in those relations
    entity_ids: set[int] = set()
    for r in relevant_rels:
        if r.source_type == "entity":
            entity_ids.add(r.source_id)
        if r.target_type == "entity":
            entity_ids.add(r.target_id)

    entities = [e for e in crud.list_entities(session, limit=2000) if e.id in entity_ids]

    nodes: dict[str, GraphNode] = {}
    if article:
        k = node_id("article", article_id)
        nodes[k] = GraphNode(id=k, name=article.title, type="article", raw_id=article.id, category=0)
    for ev in events:
        k = node_id("event", ev.id)
        nodes[k] = GraphNode(id=k, name=ev.title, type="event", raw_id=ev.id, category=1)
    for idea in ideas:
        k = node_id("idea", idea.id)
        nodes[k] = GraphNode(id=k, name=idea.name, type="idea", raw_id=idea.id, category=2)
    for entity in entities:
        k = node_id("entity", entity.id)
        nodes[k] = GraphNode(id=k, name=entity.name, type="entity", raw_id=entity.id, category=3)

    edges = [
        GraphEdge(
            source=node_id(r.source_type, r.source_id),
            target=node_id(r.target_type, r.target_id),
            relation_type=r.relation_type,
        )
        for r in relevant_rels
        if node_id(r.source_type, r.source_id) in nodes
        and node_id(r.target_type, r.target_id) in nodes
    ]

    return GraphRead(nodes=list(nodes.values()), edges=edges)


def _full_graph(session: Session) -> GraphRead:
    """Return the complete knowledge graph (no article filter)."""
    nodes: dict[str, GraphNode] = {}

    for article in crud.list_articles(session, limit=500):
        k = node_id("article", article.id)
        nodes[k] = GraphNode(id=k, name=article.title, type="article", raw_id=article.id, category=0)

    for ev in crud.list_events(session, limit=1000, sort="start_date"):
        k = node_id("event", ev.id)
        nodes[k] = GraphNode(id=k, name=ev.title, type="event", raw_id=ev.id, category=1)

    for idea in crud.list_ideas(session, limit=1000):
        k = node_id("idea", idea.id)
        nodes[k] = GraphNode(id=k, name=idea.name, type="idea", raw_id=idea.id, category=2)

    for entity in crud.list_entities(session, limit=1000):
        k = node_id("entity", entity.id)
        nodes[k] = GraphNode(id=k, name=entity.name, type="entity", raw_id=entity.id, category=3)

    edges = [
        GraphEdge(
            source=node_id(r.source_type, r.source_id),
            target=node_id(r.target_type, r.target_id),
            relation_type=r.relation_type,
        )
        for r in crud.list_relations(session)
        if node_id(r.source_type, r.source_id) in nodes
        and node_id(r.target_type, r.target_id) in nodes
    ]

    return GraphRead(nodes=list(nodes.values()), edges=edges)
