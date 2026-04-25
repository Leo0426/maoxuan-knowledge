"""Sync book articles and GPT-extracted knowledge graph into the database.

Usage:
    python scripts/sync.py              # sync all files
    python scripts/sync.py 000 001 005  # sync specific prefixes

File naming convention (prefix NNN must match exactly):
    data/book/NNN-title.md        ← article markdown
    data/processed/NNN-title.json ← GPT-extracted knowledge graph (optional)

Article ID mapping:
    Filename prefix → Article.id:  "000" → 0, "001" → 1, "025" → 25
    This is deterministic and stable regardless of insertion order.

Idempotent: safe to run multiple times. Re-running updates article metadata
and skips already-imported events/ideas/entities/relations.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = ROOT.parent
sys.path.insert(0, str(ROOT))

from sqlmodel import Session, select  # noqa: E402

from app.database import create_db_and_tables, engine  # noqa: E402
from app.models import Article, Entity, Event, Idea, Relation  # noqa: E402

BOOK_DIR = PROJECT_ROOT / "data" / "book"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
TOC_FILE = BOOK_DIR / "目录.md"

# Matches filenames like 000-title.md or 000-title.json
ARTICLE_FILE_RE = re.compile(r"^(\d{3})-(.+)$")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def prefix_to_id(prefix: str) -> int:
    """'000' → 0, '007' → 7, '025' → 25"""
    return int(prefix)


def id_to_prefix(article_id: int) -> str:
    """0 → '000', 7 → '007', 25 → '025'"""
    return str(article_id).zfill(3)


def parse_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        parts = value.split("-")
        if len(parts) == 3:
            return date(int(parts[0]), int(parts[1]), int(parts[2]))
        if len(parts) == 1:
            return date(int(parts[0]), 1, 1)
    except (ValueError, IndexError):
        pass
    return None


def load_json_file(path: Path) -> Optional[dict]:
    """Load JSON, tolerating leading zeros in number literals (e.g. 000 → 0)."""
    text = path.read_text(encoding="utf-8")
    text = re.sub(r":\s*0*(\d+)", lambda m: f": {int(m.group(1))}", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"  [ERROR] Failed to parse {path.name}: {e}")
        return None


# ---------------------------------------------------------------------------
# TOC / Article Metadata
# ---------------------------------------------------------------------------

def period_from_heading(volume: str, heading: str, prefix: str) -> Optional[str]:
    """Derive the historical period from a TOC heading and article prefix."""
    title = heading.replace(volume, "", 1).strip()
    if volume == "第一卷" and "第一次国内革命战争时期" in title:
        return "第一次国内革命战争时期" if prefix in {"000", "001"} else "第二次国内革命战争时期"
    return title or None


def parse_toc_metadata() -> dict[str, dict[str, Optional[str]]]:
    """Return prefix → article metadata from data/book/目录.md."""
    if not TOC_FILE.exists():
        return {}
    metadata: dict[str, dict[str, Optional[str]]] = {}
    current_volume: Optional[str] = None
    current_heading = ""
    current_period: Optional[str] = None
    for line in TOC_FILE.read_text(encoding="utf-8").splitlines():
        vol_match = re.match(r"^#\s+(第[一二三四五]卷)", line)
        if vol_match:
            current_volume = vol_match.group(1)
            current_heading = line.lstrip("#").strip()
            current_period = None
        period_match = re.match(r"^##\s+(.+)", line)
        if period_match:
            current_period = period_match.group(1).strip()
        link_match = re.search(r"\[(\d{3})-", line)
        if link_match and current_volume:
            prefix = link_match.group(1)
            metadata[prefix] = {
                "volume": current_volume,
                "period": current_period or period_from_heading(current_volume, current_heading, prefix),
            }
    return metadata


# ---------------------------------------------------------------------------
# Markdown parsing
# ---------------------------------------------------------------------------

def parse_md(path: Path) -> dict:
    """Extract title, date_text, start_date, content from a book markdown file.

    Title is derived from the filename (more reliable than the # heading).
    The # heading line is stripped from content if present.
    Date is parsed from the （...） parenthetical line near the top.
    """
    stem_match = ARTICLE_FILE_RE.match(path.stem)
    title = stem_match.group(2) if stem_match else path.stem

    raw = path.read_text(encoding="utf-8")
    lines = raw.splitlines(keepends=True)

    # Strip leading # heading if present (redundant with filename)
    if lines and re.match(r"^#\s+", lines[0]):
        lines = lines[1:]

    content = "".join(lines)

    # Extract date from first （...） line
    date_text: Optional[str] = None
    start_date: Optional[date] = None
    for line in lines[:10]:
        m = re.search(r"[（(]([一二三四五六七八九十零百千年月日]+)[）)]", line)
        if m:
            date_text = m.group(1)
            start_date = _parse_chinese_date(date_text)
            break

    return {
        "title": title,
        "date_text": date_text,
        "start_date": start_date,
        "content": content,
    }


_CN_DIGITS = {"零": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
              "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}

def _parse_chinese_date(text: str) -> Optional[date]:
    """Convert '一九二五年十二月一日' → date(1925, 12, 1)."""
    try:
        year_m = re.search(r"([一二三四五六七八九零]+)年", text)
        month_m = re.search(r"([一二三四五六七八九十]+)月", text)
        day_m = re.search(r"([一二三四五六七八九十]+)日", text)

        def cn_to_int(s: str) -> int:
            result = 0
            for ch in s:
                result = result * 10 + _CN_DIGITS.get(ch, 0)
            return result

        def cn_month_day(s: str) -> int:
            if "十" not in s:
                return cn_to_int(s)
            parts = s.split("十")
            tens = _CN_DIGITS.get(parts[0], 1) if parts[0] else 1
            ones = _CN_DIGITS.get(parts[1], 0) if len(parts) > 1 and parts[1] else 0
            return tens * 10 + ones

        if not year_m:
            return None
        year = cn_to_int(year_m.group(1))
        month = cn_month_day(month_m.group(1)) if month_m else 1
        day = cn_month_day(day_m.group(1)) if day_m else 1
        return date(year, month, day)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# DB upsert helpers
# ---------------------------------------------------------------------------

def upsert_article(
    session: Session,
    article_id: int,
    md: dict,
    volume: Optional[str],
    period: Optional[str],
) -> Article:
    """Insert new article or update metadata of existing one. Returns the article."""
    article = session.get(Article, article_id)
    if article is None:
        article = Article(
            id=article_id,
            title=md["title"],
            volume=volume,
            period=period,
            date_text=md["date_text"],
            start_date=md["start_date"],
            content=md["content"],
        )
    else:
        article.title = md["title"]
        article.volume = volume or article.volume
        article.period = period or article.period
        article.date_text = md["date_text"] or article.date_text
        article.start_date = md["start_date"] or article.start_date
        article.content = md["content"]
    session.add(article)
    return article


# ---------------------------------------------------------------------------
# JSON knowledge graph import
# ---------------------------------------------------------------------------

def import_knowledge(
    session: Session,
    article: Article,
    data: dict,
    entity_cache: dict[str, int],
) -> dict:
    """Import events, ideas, entities, relations from GPT JSON for one article."""
    counts = {"events": 0, "ideas": 0, "entities": 0, "relations": 0, "skipped": 0}
    article_id = article.id

    # Supplement article metadata from JSON if md parsing missed it
    art = data.get("article", {})
    if art.get("date_text") and not article.date_text:
        article.date_text = art["date_text"]
    if art.get("start_date") and not article.start_date:
        article.start_date = parse_date(art["start_date"])
    if art.get("end_date") and not article.end_date:
        article.end_date = parse_date(art["end_date"])
    if art.get("source") and not article.source:
        article.source = art["source"]
    session.add(article)

    # --- Entities (global deduplication by name) ---
    for e in data.get("entities", []):
        name = e["name"].strip()
        if name in entity_cache:
            counts["skipped"] += 1
            continue
        existing = session.exec(select(Entity).where(Entity.name == name)).first()
        if existing:
            entity_cache[name] = existing.id
            counts["skipped"] += 1
            continue
        entity = Entity(name=name, type=e.get("type", "概念"), description=e.get("description"))
        session.add(entity)
        session.flush()
        entity_cache[name] = entity.id
        counts["entities"] += 1

    # --- Events ---
    existing_event_titles = {
        ev.title
        for ev in session.exec(select(Event).where(Event.article_id == article_id)).all()
    }
    for ev in data.get("events", []):
        ev_title = ev["title"].strip()
        if ev_title in existing_event_titles:
            counts["skipped"] += 1
            continue
        session.add(Event(
            article_id=article_id,
            title=ev_title,
            description=ev.get("description", ""),
            date_text=ev.get("date_text"),
            start_date=parse_date(ev.get("start_date")),
            end_date=parse_date(ev.get("end_date")),
            location=ev.get("location"),
            importance=int(ev.get("importance", 3)),
            quote=ev.get("quote"),
        ))
        existing_event_titles.add(ev_title)
        counts["events"] += 1

    # --- Ideas ---
    existing_idea_names = {
        i.name
        for i in session.exec(select(Idea).where(Idea.article_id == article_id)).all()
    }
    for idea_data in data.get("ideas", []):
        idea_name = idea_data["name"].strip()
        if idea_name in existing_idea_names:
            counts["skipped"] += 1
            continue
        session.add(Idea(
            article_id=article_id,
            name=idea_name,
            summary=idea_data.get("summary", ""),
            category=idea_data.get("category"),
            quote=idea_data.get("quote"),
        ))
        existing_idea_names.add(idea_name)
        counts["ideas"] += 1

    # Flush to assign IDs before building relations
    session.flush()

    event_title_to_id = {
        ev.title: ev.id
        for ev in session.exec(select(Event).where(Event.article_id == article_id)).all()
    }
    idea_name_to_id = {
        i.name: i.id
        for i in session.exec(select(Idea).where(Idea.article_id == article_id)).all()
    }

    def resolve_id(node_type: str, raw) -> Optional[int]:
        if node_type == "Article":
            # Always resolve to the current article's DB id
            return article_id
        if node_type == "Entity":
            return entity_cache.get(str(raw))
        if node_type == "Event":
            return event_title_to_id.get(str(raw)) if isinstance(raw, str) else int(raw)
        if node_type == "Idea":
            return idea_name_to_id.get(str(raw)) if isinstance(raw, str) else int(raw)
        return None

    # --- Relations ---
    existing_relations = {
        (r.source_type, r.source_id, r.target_type, r.target_id)
        for r in session.exec(select(Relation)).all()
    }
    for rel in data.get("relations", []):
        src_type = rel["source_type"]
        tgt_type = rel["target_type"]
        src_id = resolve_id(src_type, rel["source_id"])
        tgt_id = resolve_id(tgt_type, rel["target_id"])
        if src_id is None or tgt_id is None:
            print(f"  [WARN] Cannot resolve relation "
                  f"{src_type}:{rel['source_id']} → {tgt_type}:{rel['target_id']}, skipping")
            counts["skipped"] += 1
            continue
        key = (src_type, src_id, tgt_type, tgt_id)
        if key in existing_relations:
            counts["skipped"] += 1
            continue
        session.add(Relation(
            source_type=src_type,
            source_id=src_id,
            target_type=tgt_type,
            target_id=tgt_id,
            relation_type=rel.get("relation_type", "关联"),
        ))
        existing_relations.add(key)
        counts["relations"] += 1

    return counts


# ---------------------------------------------------------------------------
# Main sync logic
# ---------------------------------------------------------------------------

def find_md_files(prefixes: Optional[list[str]] = None) -> list[tuple[str, Path]]:
    """Return sorted list of (prefix, path) for book markdown files."""
    results = []
    for path in sorted(BOOK_DIR.glob("*.md")):
        m = ARTICLE_FILE_RE.match(path.stem)
        if not m:
            continue
        prefix = m.group(1)
        if prefixes and prefix not in prefixes:
            continue
        results.append((prefix, path))
    return results


def find_json_for_prefix(prefix: str) -> Optional[Path]:
    """Find data/processed/NNN-*.json matching the given prefix."""
    matches = list(PROCESSED_DIR.glob(f"{prefix}-*.json"))
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        print(f"  [WARN] Multiple JSON files for prefix {prefix}: {[p.name for p in matches]}")
        return matches[0]
    return None


def main() -> None:
    create_db_and_tables()

    # Parse CLI prefixes (e.g. 000 001 005)
    requested = [p.zfill(3) for p in sys.argv[1:]] if len(sys.argv) > 1 else None

    md_files = find_md_files(requested)
    if not md_files:
        print("No matching markdown files found.")
        return

    toc_metadata = parse_toc_metadata()

    # Pre-load entity cache to share across all files
    with Session(engine) as session:
        entity_cache: dict[str, int] = {
            e.name: e.id
            for e in session.exec(select(Entity)).all()
        }

    total = {"articles": 0, "events": 0, "ideas": 0, "entities": 0, "relations": 0}

    for prefix, md_path in md_files:
        article_id = prefix_to_id(prefix)
        json_path = find_json_for_prefix(prefix)

        label = f"{prefix} ({md_path.stem})"
        print(f"Syncing {label} ...")

        with Session(engine) as session:
            md = parse_md(md_path)
            article_meta = toc_metadata.get(prefix, {})
            article = upsert_article(
                session,
                article_id,
                md,
                article_meta.get("volume"),
                article_meta.get("period"),
            )
            total["articles"] += 1

            if json_path:
                data = load_json_file(json_path)
                if data:
                    counts = import_knowledge(session, article, data, entity_cache)
                    session.commit()
                    for k in ("events", "ideas", "entities", "relations"):
                        total[k] += counts[k]
                    print(f"  id={article_id}  events={counts['events']}  "
                          f"ideas={counts['ideas']}  entities={counts['entities']}  "
                          f"relations={counts['relations']}  skipped={counts['skipped']}")
                else:
                    session.commit()
                    print(f"  id={article_id}  [JSON parse failed, article only]")
            else:
                session.commit()
                print(f"  id={article_id}  [no JSON]")

    print(f"\nDone — articles: {total['articles']}, events: {total['events']}, "
          f"ideas: {total['ideas']}, entities: {total['entities']}, "
          f"relations: {total['relations']}")


if __name__ == "__main__":
    main()
