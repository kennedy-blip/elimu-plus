#!/usr/bin/env python3
"""Render the Jinja site into the repository-root directory used by Render."""

from __future__ import annotations

import shutil
from pathlib import Path

from build import build_site

ROOT = Path(__file__).resolve().parent
REPOSITORY_ROOT = ROOT.parent.resolve()
PUBLISH_DIR = REPOSITORY_ROOT / "dist"


def build_render_site() -> Path:
    """Build to the Render publish directory without allowing arbitrary paths."""
    if PUBLISH_DIR.parent != REPOSITORY_ROOT or PUBLISH_DIR.name != "dist":
        raise ValueError("Render output must be the repository-root dist directory")
    if PUBLISH_DIR.is_symlink():
        raise ValueError("Refusing to replace a symlink at the Render publish path")

    source_dir = build_site()
    if PUBLISH_DIR.exists():
        if not PUBLISH_DIR.is_dir():
            raise ValueError("The Render publish path exists and is not a directory")
        shutil.rmtree(PUBLISH_DIR)
    shutil.copytree(source_dir, PUBLISH_DIR)
    return PUBLISH_DIR


if __name__ == "__main__":
    destination = build_render_site()
    count = sum(1 for path in destination.rglob("*") if path.is_file())
    print(f"Built {count} files into {destination.relative_to(REPOSITORY_ROOT)}")
