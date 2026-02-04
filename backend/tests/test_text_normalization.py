"""Tests for text normalization rules."""

from app.api.v1.texts import load_texts
from app.core.text_normalization import normalize_pages


def test_pages_1_and_2_unchanged():
    """Ensure pages 1 and 2 are unchanged after normalization."""
    texts = load_texts()
    for text in texts:
        original_pages = text.get("Pages", [])
        normalized_pages = normalize_pages(original_pages, start_page_index=2)

        for i in range(min(2, len(original_pages))):
            assert normalized_pages[i] == original_pages[i]


def test_normalized_pages_line_limits():
    """Ensure pages >= 3 have max 8 lines and each line <= 39 chars."""
    texts = load_texts()
    for text in texts:
        original_pages = text.get("Pages", [])
        normalized_pages = normalize_pages(original_pages, start_page_index=2)

        for page in normalized_pages[2:]:
            assert len(page) <= 8
            for line in page:
                assert len(line) <= 39