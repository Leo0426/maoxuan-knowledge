from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app import crud
from app.database import get_session
from app.models import Article
from app.schemas import ArticleRead, ArticleSummary

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("", response_model=list[ArticleRead])
def read_articles(
    limit: int = Query(default=300, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
):
    return crud.list_articles(session, limit=limit, offset=offset)


# /toc must be declared before /{article_id} to avoid routing conflict
@router.get("/toc", response_model=list[ArticleSummary])
def read_articles_toc(session: Session = Depends(get_session)):
    """Lightweight article list (no content) for sidebar table of contents."""
    return list(session.exec(select(Article).order_by(Article.id)).all())


@router.get("/{article_id}", response_model=ArticleRead)
def read_article(article_id: int, session: Session = Depends(get_session)):
    article = crud.get_article(session, article_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article
