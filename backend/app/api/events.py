from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app import crud
from app.database import get_session
from app.schemas import EventRead

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[EventRead])
def read_events(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    sort: Optional[str] = Query(default=None),
    article_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    return crud.list_events(session, limit=limit, offset=offset, sort=sort, article_id=article_id)


# /timeline must be before /{event_id}
@router.get("/timeline", response_model=list[EventRead])
def read_timeline(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    article_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    return crud.list_events(
        session, limit=limit, offset=offset, sort="start_date", article_id=article_id
    )


@router.get("/{event_id}", response_model=EventRead)
def read_event(event_id: int, session: Session = Depends(get_session)):
    event = crud.get_event(session, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
