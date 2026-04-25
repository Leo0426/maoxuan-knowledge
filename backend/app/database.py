from pathlib import Path

from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR / 'app.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    from app import models  # noqa: F401

    SQLModel.metadata.create_all(engine)
    ensure_schema()


def ensure_schema() -> None:
    """Apply tiny SQLite migrations needed by existing local MVP databases."""
    with engine.begin() as conn:
        article_columns = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(article)")).fetchall()
        }
        if "period" not in article_columns:
            conn.execute(text("ALTER TABLE article ADD COLUMN period VARCHAR"))


def get_session():
    with Session(engine) as session:
        yield session
