from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app import crud
from app.database import get_session
from app.schemas import SearchResults

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResults)
def search(
    q: str = Query(default=""),
    limit: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
):
    return crud.search_all(session, q=q, limit=limit)
