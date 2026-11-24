#!/usr/bin/env python3
"""Build the independent Elimu Plus static site with Jinja2."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

ROOT = Path(__file__).resolve().parent
TEMPLATES_DIR = ROOT / "templates"
STATIC_DIR = ROOT / "static"
DATA_DIR = ROOT / "data"
DEFAULT_OUTPUT_DIR = ROOT / "dist"


def _read_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as source:
        value = json.load(source)
    if not isinstance(value, dict):
        raise ValueError(f"Expected a JSON object in {path}")
    return value


def build_site(output_dir: Path = DEFAULT_OUTPUT_DIR) -> Path:
    """Render the landing page and copy only the static inputs into output_dir."""
    config = _read_json(ROOT / "site-config.json")
    content = _read_json(DATA_DIR / "learning-content.json")
    levels = content.get("grade_levels")
    if not isinstance(levels, list) or len(levels) != 3:
        raise ValueError("learning-content.json must define the three CBC grade levels")
    for collection in ("competencies", "quizzes", "lessons", "labs", "languages", "downloadable_content"):
        if not isinstance(content.get(collection), list):
            raise ValueError(f"learning-content.json must define {collection} as a list")
    for quiz in content["quizzes"]:
        for question in quiz.get("questions", []):
            correct = question.get("correct")
            if not isinstance(correct, int) or not 0 <= correct < len(question.get("options", [])):
                raise ValueError(f"Quiz {quiz.get('id', '(unknown)')} contains an invalid answer index")

    output_dir = Path(output_dir).resolve()
    if output_dir == ROOT or ROOT not in output_dir.parents:
        raise ValueError("Build output must be a child of the static-site directory")
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)

    env = Environment(
        loader=FileSystemLoader(TEMPLATES_DIR),
        autoescape=select_autoescape(("html", "xml")),
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    rendered = env.get_template("index.html").render(config=config, content=content)
    (output_dir / "index.html").write_text(rendered, encoding="utf-8")
    shutil.copy2(ROOT / "site-config.json", output_dir / "site-config.json")
    shutil.copytree(STATIC_DIR, output_dir / "static")
    shutil.copytree(DATA_DIR, output_dir / "data")
    return output_dir


if __name__ == "__main__":
    destination = build_site()
    count = sum(1 for path in destination.rglob("*") if path.is_file())
    print(f"Built {count} files into {destination.relative_to(ROOT)}")
