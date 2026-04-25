from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import create_db_and_tables, DATA_DIR  # noqa: E402


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    create_db_and_tables()
    print(f"Initialized SQLite database at {DATA_DIR / 'app.db'}")


if __name__ == "__main__":
    main()
