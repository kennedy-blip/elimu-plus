import json
import shutil
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path

import build
import render_build


class TextCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


class StaticBuildTests(unittest.TestCase):
    def test_build_emits_landing_page_assets_and_static_json(self):
        with tempfile.TemporaryDirectory(dir=build.ROOT) as temporary:
            output = build.build_site(Path(temporary) / "preview")

            html_path = output / "index.html"
            self.assertTrue(html_path.is_file())
            html = html_path.read_text(encoding="utf-8")
            text = TextCollector()
            text.feed(html)
            visible_text = " ".join(" ".join(text.parts).split())

            self.assertIn("Elimu Plus", visible_text)
            self.assertIn("Choose your level", visible_text)
            self.assertIn("Upper Primary", visible_text)
            self.assertIn("Junior Secondary", visible_text)
            self.assertIn("Senior School", visible_text)
            self.assertEqual(html.count('class="level-card '), 3)

            for asset in (
                "site-config.json",
                "static/css/site.css",
                "static/css/app.css",
                "static/js/app.mjs",
                "static/js/logic.mjs",
                "static/js/views.mjs",
                "data/learning-content.json",
            ):
                with self.subTest(asset=asset):
                    self.assertTrue((output / asset).is_file())

            content = json.loads((output / "data/learning-content.json").read_text(encoding="utf-8"))
            self.assertEqual(len(content["grade_levels"]), 3)
            self.assertEqual(len(content["competencies"]), 7)
            self.assertEqual(len(content["quizzes"]), 6)
            self.assertEqual(len(content["lessons"]), 8)
            self.assertEqual(len(content["labs"]), 8)
            self.assertEqual(len(content["languages"]), 8)

            all_output = "\n".join(
                path.read_text(encoding="utf-8")
                for path in output.rglob("*")
                if path.is_file() and path.suffix in {".html", ".json", ".js", ".mjs", ".css"}
            )
            self.assertNotIn("VITE_OPENAI_API_KEY", all_output)

    def test_build_refuses_to_write_outside_sidecar(self):
        with self.assertRaisesRegex(ValueError, "child of the static-site directory"):
            build.build_site(build.ROOT.parent / "outside-output")

    def test_render_build_populates_repository_publish_directory(self):
        publish_dir = render_build.PUBLISH_DIR
        with tempfile.TemporaryDirectory() as backup_dir:
            backup = Path(backup_dir) / "dist"
            existed = publish_dir.exists()
            if existed:
                self.assertTrue(publish_dir.is_dir())
                self.assertFalse(publish_dir.is_symlink())
                shutil.copytree(publish_dir, backup)
            try:
                output = render_build.build_render_site()
                self.assertEqual(output, publish_dir)
                self.assertTrue((output / "index.html").is_file())
                self.assertTrue((output / "static/js/legacy-import.mjs").is_file())
                self.assertTrue((output / "data/learning-content.json").is_file())
            finally:
                if publish_dir.exists():
                    shutil.rmtree(publish_dir)
                if existed:
                    shutil.copytree(backup, publish_dir)


if __name__ == "__main__":
    unittest.main()
