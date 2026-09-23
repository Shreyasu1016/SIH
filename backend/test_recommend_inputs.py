"""Focused input tests for multilingual and PDF recommendations.

Run from backend/ with:
    python -m unittest test_recommend_inputs.py
"""

import unittest
from unittest.mock import patch

from app.routers.search import _detect_query_language, _extract_pdf_text, _recommend


class RecommendationInputTests(unittest.TestCase):
    @staticmethod
    def _sample_tender_pdf() -> bytes:
        content = (
            b"BT /F1 12 Tf 72 720 Td "
            b"(Tender specification: industrial safety helmets) Tj ET"
        )
        objects = [
            b"<< /Type /Catalog /Pages 2 0 R >>",
            b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            b"/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
            b"<< /Length " + str(len(content)).encode() + b" >>\nstream\n"
            + content + b"\nendstream",
            b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        ]
        pdf = bytearray(b"%PDF-1.4\n")
        offsets = [0]
        for number, body in enumerate(objects, 1):
            offsets.append(len(pdf))
            pdf.extend(f"{number} 0 obj\n".encode())
            pdf.extend(body)
            pdf.extend(b"\nendobj\n")
        xref_offset = len(pdf)
        pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode())
        pdf.extend(b"0000000000 65535 f \n")
        for offset in offsets[1:]:
            pdf.extend(f"{offset:010d} 00000 n \n".encode())
        pdf.extend(
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n".encode()
        )
        return bytes(pdf)

    def test_hindi_query_is_detected_without_translation(self):
        query = "निर्माण श्रमिकों के लिए सुरक्षा हेलमेट"
        self.assertEqual(_detect_query_language(query), "hi")

    @patch("app.routers.search.get_recommendation_explanation")
    @patch("app.routers.search._retrieve_standards")
    def test_hindi_query_uses_shared_recommendation_pipeline(
        self, retrieve_standards, get_explanation
    ):
        query = "निर्माण श्रमिकों के लिए सुरक्षा हेलमेट"
        retrieve_standards.return_value = [{
            "is_number": "IS 2925:1984",
            "title": "Industrial Safety Helmets",
            "similarity_score": 0.82,
            "scope_text": "Safety helmets for construction workers",
            "version_info": {},
            "certifications": [],
            "allied_standards": {},
        }]
        get_explanation.return_value = ("rule_based", [{
            "is_number": "IS 2925:1984",
            "explanation": "Matched construction safety requirements.",
            "confidence": 0.82,
            "certification_flag": False,
        }])
        result = _recommend(query, 1, _detect_query_language(query), None)
        self.assertEqual(result["language"], "hi")
        self.assertEqual(result["results"][0]["is_number"], "IS 2925:1984")

    def test_tender_pdf_text_is_extracted_from_first_pages(self):
        text = _extract_pdf_text(self._sample_tender_pdf())
        self.assertIn("industrial safety helmets", text)


if __name__ == "__main__":
    unittest.main()
