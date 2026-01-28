from __future__ import annotations

from typing import Any, Dict, List
import textwrap


def _wrap_line(line: str, max_chars: int) -> List[str]:
    if line == "":
        return [""]

    wrapper = textwrap.TextWrapper(
        width=max_chars,
        break_long_words=True,
        break_on_hyphens=False,
        replace_whitespace=False,
        drop_whitespace=False,
    )

    wrapped = wrapper.wrap(line)
    return wrapped if wrapped else [""]


def normalize_pages(
    pages: List[List[str]],
    start_page_index: int = 2,
    max_lines: int = 8,
    max_chars: int = 39,
) -> List[List[str]]:
    """
    Normalize pages for RV projection.

    - Pages before start_page_index are returned unchanged.
    - From start_page_index onward, lines are wrapped to max_chars.
    - Each page has at most max_lines; overflow creates new pages.
    - No padding with empty lines.
    """
    if not pages:
        return []

    normalized_pages: List[List[str]] = [list(page) for page in pages[:start_page_index]]

    for page in pages[start_page_index:]:
        normalized_lines: List[str] = []
        for line in page:
            normalized_lines.extend(_wrap_line(line, max_chars))

        if not normalized_lines:
            normalized_pages.append([])
            continue

        for i in range(0, len(normalized_lines), max_lines):
            normalized_pages.append(normalized_lines[i : i + max_lines])

    return normalized_pages


def normalize_text_object(
    text: Dict[str, Any],
    start_page_index: int = 2,
) -> Dict[str, Any]:
    """Return a copy of text with normalized Pages (if present)."""
    if not text or "Pages" not in text:
        return text

    normalized = dict(text)
    normalized["Pages"] = normalize_pages(
        text.get("Pages", []),
        start_page_index=start_page_index,
    )
    return normalized