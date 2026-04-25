from __future__ import annotations

import re
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.schemas import BookArticleDetail, BookArticleSummary

router = APIRouter(prefix="/api/book", tags=["book"])

BOOK_DIR = Path(__file__).resolve().parents[3] / "data" / "book"

_FILENAME_RE = re.compile(r"^(\d+)-(.+)$")


def _parse_file(path: Path) -> tuple[int, str, str]:
    """Return (id, slug, title) from a book markdown file path."""
    stem = path.stem  # e.g. "000-中国社会各阶级的分析"
    m = _FILENAME_RE.match(stem)
    if m:
        article_id = int(m.group(1))
        slug = stem
    else:
        article_id = 0
        slug = stem
    # Extract title from first H1 heading, fall back to stem
    text = path.read_text(encoding="utf-8")
    title_match = re.search(r"^#\s+(.+)", text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else stem
    return article_id, slug, title


def _list_book_files() -> list[Path]:
    return sorted(BOOK_DIR.glob("*.md"))


@router.get("", response_model=list[BookArticleSummary])
def list_book_articles():
    results = []
    for path in _list_book_files():
        if path.stem in ("SUMMARY", "目录"):
            continue
        article_id, slug, title = _parse_file(path)
        results.append(BookArticleSummary(id=article_id, slug=slug, title=title))
    return results


@router.get("/{slug}", response_model=BookArticleDetail)
def get_book_article(slug: str):
    path = BOOK_DIR / f"{slug}.md"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Article not found")
    article_id, slug_parsed, title = _parse_file(path)
    content = path.read_text(encoding="utf-8")
    return BookArticleDetail(id=article_id, slug=slug_parsed, title=title, content=content)
