from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app import crud
from app.database import get_session
from app.schemas import EntityRead

router = APIRouter(prefix="/api/entities", tags=["entities"])


@router.get("", response_model=list[EntityRead])
def read_entities(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
):
    return crud.list_entities(session, limit=limit, offset=offset)
