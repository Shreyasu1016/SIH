"""Tests for local OCR fallback on scanned PDFs and procurement images."""

import io
import unittest
from unittest.mock import patch

import pymupdf
from PIL import Image
from fastapi import HTTPException

from app.routers.search import _extract_image_text, _extract_pdf_text


class OCRExtractionTests(unittest.TestCase):
    @staticmethod
    def _scanned_pdf() -> bytes:
        image_bytes = io.BytesIO()
        Image.new("RGB", (800, 350), "white").save(image_bytes, format="PNG")
        document = pymupdf.open()
        page = document.new_page()
        page.insert_image(page.rect, stream=image_bytes.getvalue())
        content = document.tobytes()
        document.close()
        return content

    @staticmethod
    def _sample_image() -> bytes:
        image_bytes = io.BytesIO()
        Image.new("RGB", (320, 120), "white").save(image_bytes, format="PNG")
        return image_bytes.getvalue()

    @patch("app.routers.search._ocr_image")
    def test_scanned_pdf_page_uses_local_ocr(self, ocr_image):
        ocr_image.return_value = "Tender for industrial safety helmets"
        text = _extract_pdf_text(self._scanned_pdf())
        self.assertIn("industrial safety helmets", text)
        ocr_image.assert_called_once()

    @patch("app.routers.search._ocr_image")
    def test_image_document_uses_local_ocr(self, ocr_image):
        ocr_image.return_value = "Purchase order for protective equipment"
        text = _extract_image_text(self._sample_image())
        self.assertEqual(text, "Purchase order for protective equipment")
        ocr_image.assert_called_once()

    @patch("app.routers.search._ocr_image")
    def test_scanned_pdf_without_recognized_text_returns_clear_error(self, ocr_image):
        ocr_image.return_value = ""
        with self.assertRaises(HTTPException) as raised:
            _extract_pdf_text(self._scanned_pdf())
        self.assertEqual(raised.exception.status_code, 422)
        self.assertIn("even after OCR", raised.exception.detail)


if __name__ == "__main__":
    unittest.main()
