from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .config import settings


def _ensure_aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        # Assume UTC when DB/driver returns naive timestamps.
        return dt.replace(tzinfo=timezone.utc)
    return dt


def to_local_datetime(dt: datetime) -> datetime:
    try:
        tz = ZoneInfo(settings.TIMEZONE)
    except ZoneInfoNotFoundError:
        # On Windows (and some slim containers), the IANA tz database may be missing
        # unless the `tzdata` package is installed. Peru (America/Lima) has no DST,
        # so a fixed UTC-5 offset is a safe fallback for this project.
        if settings.TIMEZONE == "America/Lima":
            tz = timezone(timedelta(hours=-5))
        else:
            tz = timezone.utc

    return _ensure_aware(dt).astimezone(tz)


def to_local_iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return to_local_datetime(dt).isoformat()
