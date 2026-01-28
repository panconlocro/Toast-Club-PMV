from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from pathlib import Path
import json
from ...core.text_normalization import normalize_pages

router = APIRouter()

# Path to the texts JSON file
TEXTS_FILE = Path(__file__).parent.parent.parent.parent / "data" / "LecturasToast.json"


class TextSummary(BaseModel):
    """Summary of a text (for listing)."""
    Id: str
    Title: str
    Tags: Dict[str, str]


class TextFull(BaseModel):
    """Full text object including pages."""
    Id: str
    Title: str
    Pages: List[List[str]]  # Array of pages, each page is an array of lines
    Tags: Dict[str, str]


class TextsListResponse(BaseModel):
    """Response for listing all texts."""
    texts: List[TextSummary]
    total: int


def load_texts() -> List[Dict[str, Any]]:
    """Load all texts from the JSON file."""
    if not TEXTS_FILE.exists():
        raise FileNotFoundError(f"Texts file not found: {TEXTS_FILE}")
    
    with open(TEXTS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    return data.get("texts", [])


def get_text_by_id(text_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific text by its Id.
    Returns None if not found.
    """
    texts = load_texts()
    return next((t for t in texts if t["Id"] == text_id), None)


@router.get("/texts", response_model=TextsListResponse)
def list_texts():
    """
    List all available training texts.
    Returns summaries (Id, Title, Tags) without the full Pages array.
    """
    try:
        texts = load_texts()
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
    summaries = [
        TextSummary(
            Id=t["Id"],
            Title=t["Title"],
            Tags=t.get("Tags", {})
        )
        for t in texts
    ]
    
    return TextsListResponse(texts=summaries, total=len(summaries))


@router.get("/texts/{text_id}", response_model=TextFull)
def get_text(text_id: str):
    """
    Get a specific text by Id, including the full Pages array.
    """
    try:
        text = get_text_by_id(text_id)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
    if not text:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Text with Id '{text_id}' not found"
        )
    
    normalized_pages = normalize_pages(text.get("Pages", []), start_page_index=2)

    return TextFull(
        Id=text["Id"],
        Title=text["Title"],
        Pages=normalized_pages,
        Tags=text.get("Tags", {})
    )