"""Tests for text tags filtering and tags index endpoint."""

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_texts_filter_by_tags_case_insensitive_and_trim():
    response = client.get(
        "/api/v1/texts",
        params={"tema": "  ESPECIALIZACIÓN  ", "tono": "ComBatiVo"},
    )
    assert response.status_code == 200
    data = response.json()

    assert data["total"] >= 1
    for text in data["texts"]:
        tags = text.get("Tags", {})
        assert tags.get("tema", "").strip().casefold() == "especialización"
        assert tags.get("tono", "").strip().casefold() == "combativo"


def test_texts_filter_unknown_tag_key_returns_empty():
    response = client.get("/api/v1/texts", params={"tag_inexistente": "x"})
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 0
    assert data["texts"] == []


def test_texts_tags_index():
    response = client.get("/api/v1/texts/tags")
    assert response.status_code == 200
    data = response.json()

    assert "keys" in data
    assert "values" in data
    assert "tema" in data["keys"]
    assert "tono" in data["keys"]

    temas = data["values"].get("tema", [])
    assert "especialización" in temas
    assert temas == sorted(temas)