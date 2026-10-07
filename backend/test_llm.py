"""Tests for recommendation-provider selection and Ollama request settings."""

import os
import unittest
from unittest.mock import patch

from app.llm import get_recommendation_explanation, ollama_provider


class RecommendationProviderTests(unittest.TestCase):
    def setUp(self):
        self.candidate = {
            "is_number": "IS 2925:1984",
            "title": "Industrial Safety Helmets",
            "scope_text": "Safety helmets",
            "similarity_score": 0.82,
            "certifications": [],
        }

    @patch("app.llm.groq_provider")
    @patch("app.llm.ollama_provider")
    def test_ollama_selection_does_not_attempt_groq(self, ollama, groq):
        ollama.return_value = [{
            "is_number": self.candidate["is_number"],
            "explanation": "Matches safety helmets.",
            "confidence": 0.82,
            "certification_flag": False,
        }]
        with patch.dict(os.environ, {"LLM_PROVIDER": "ollama", "GROQ_API_KEY": "unused"}):
            source, results = get_recommendation_explanation("safety helmets", [self.candidate])

        self.assertEqual(source, "ollama")
        self.assertEqual(results[0]["is_number"], self.candidate["is_number"])
        groq.assert_not_called()

    @patch("app.llm._post_json")
    def test_ollama_uses_requested_model_and_laptop_options(self, post_json):
        post_json.return_value = {
            "response": (
                '{"results":[{"is_number":"IS 2925:1984",'
                '"explanation":"Matches safety helmets.",'
                '"confidence":0.82,"certification_flag":false}]}'
            )
        }
        ollama_provider("safety helmets", [self.candidate])

        args, kwargs = post_json.call_args
        self.assertEqual(args[1]["model"], "llama3.1:8b")
        self.assertEqual(args[1]["options"], {
            "num_ctx": 4096,
            "num_thread": 4,
            "temperature": 0.3,
        })
        self.assertEqual(args[1]["keep_alive"], "2m")
        self.assertEqual(kwargs["timeout"], 600)


if __name__ == "__main__":
    unittest.main()
