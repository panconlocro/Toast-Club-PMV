from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from .config import settings


def _ensure_aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        # Assume UTC when DB/driver returns naive timestamps.
        return dt.replace(tzinfo=timezone.utc)
    return dt


def to_local_datetime(dt: datetime) -> datetime:
    tz = ZoneInfo(settings.TIMEZONE)
    return _ensure_aware(dt).astimezone(tz)


def to_local_iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return to_local_datetime(dt).isoformat()
