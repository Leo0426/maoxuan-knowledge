from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app import crud
from app.database import get_session
from app.schemas import IdeaRead

router = APIRouter(prefix="/api/ideas", tags=["ideas"])


@router.get("", response_model=list[IdeaRead])
def read_ideas(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
):
    return crud.list_ideas(session, limit=limit, offset=offset)
