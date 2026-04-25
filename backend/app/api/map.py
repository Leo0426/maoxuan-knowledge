from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app import crud
from app.database import get_session
from app.models import Event
from app.schemas import MapLocation

router = APIRouter(prefix="/api/map", tags=["map"])

LOCATION_MARKERS = {
    "广州": {"province": "广东", "coordinates": (113.2644, 23.1291)},
    "中国": {"province": "全国", "coordinates": (104.1954, 35.8617)},
    "湖南": {"province": "湖南", "coordinates": (112.9838, 28.1124)},
    "湖南乡村": {"province": "湖南", "coordinates": (112.9838, 28.1124)},
    "赣南闽西": {"province": "江西", "coordinates": (115.8582, 25.6839)},
    "井冈山周边": {"province": "江西", "coordinates": (114.2895, 26.7481)},
    "延安": {"province": "陕西", "coordinates": (109.4897, 36.5853)},
}


def event_in_range(
    event: Event,
    start_date: Optional[date],
    end_date: Optional[date],
) -> bool:
    if event.start_date is None:
        return True
    if start_date is not None and event.start_date < start_date:
        return False
    if end_date is not None and event.start_date > end_date:
        return False
    return True


@router.get("", response_model=list[MapLocation])
def read_map_locations(
    article_id: Optional[int] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    session: Session = Depends(get_session),
):
    events = [
        event
        for event in crud.list_events(session, limit=1000, sort="start_date", article_id=article_id)
        if event.location and event.location in LOCATION_MARKERS
        and event_in_range(event, start_date, end_date)
    ]

    grouped: dict[str, list[Event]] = {}
    for event in events:
        grouped.setdefault(event.location, []).append(event)

    locations: list[MapLocation] = []
    for name, items in grouped.items():
        marker = LOCATION_MARKERS[name]
        longitude, latitude = marker["coordinates"]
        dated_events = [event for event in items if event.start_date is not None]
        locations.append(
            MapLocation(
                id=name,
                name=name,
                province=marker["province"],
                longitude=longitude,
                latitude=latitude,
                event_count=len(items),
                start_date=dated_events[0].start_date if dated_events else None,
                end_date=dated_events[-1].start_date if dated_events else None,
                events=items,
            )
        )

    return sorted(
        locations,
        key=lambda location: (location.start_date is None, location.start_date, location.name),
    )
