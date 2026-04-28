"""
Gemini 1.5 Flash — Piracy vs Fair Use Analyzer
------------------------------------------------
Given match metadata, asks Gemini to classify the detection.
Returns verdict + reasoning.
"""

import os
import json
from typing import Optional

_client = None


def _get_client():
    global _client
    if _client is None:
        import google.generativeai as genai
        api_key = os.environ.get("GEMINI_API_KEY", "")
        genai.configure(api_key=api_key)
        _client = genai.GenerativeModel("gemini-1.5-flash")
    return _client


_SYSTEM_PROMPT = """You are an expert in digital media copyright law and anti-piracy enforcement.
You will be given information about a potential copyright infringement detection.
Analyze the data and classify it as one of:
  - "piracy": Clear unauthorized reproduction of copyrighted content
  - "fair_use": Likely covered under fair use (commentary, criticism, education, parody)
  - "inconclusive": Not enough information to determine

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "<piracy|fair_use|inconclusive>",
  "confidence": <0.0-1.0>,
  "reasoning": "<one to three sentences explaining your decision>"
}"""


def analyze_match(
    original_title: str,
    original_owner: str,
    similarity_score: float,
    matched_frames: int,
    total_frames: int,
    suspect_title: Optional[str] = None,
    suspect_platform: Optional[str] = None,
    suspect_url: Optional[str] = None,
) -> dict:
    """
    Returns dict with keys: verdict, confidence, reasoning.
    Falls back to 'inconclusive' if Gemini call fails.
    """
    try:
        client = _get_client()

        user_prompt = f"""Original content: "{original_title}" (owned by {original_owner})
Similarity score: {similarity_score:.4f} (1.0 = identical, 0.0 = unrelated)
Matched frames: {matched_frames} out of {total_frames} analyzed
Suspect video title: {suspect_title or 'Unknown'}
Suspect platform: {suspect_platform or 'Unknown'}
Suspect URL: {suspect_url or 'Not available'}

Based on this data, classify this detection."""

        response = client.generate_content(
            [_SYSTEM_PROMPT, user_prompt],
            generation_config={"temperature": 0.1, "max_output_tokens": 300},
        )

        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text)
        return {
            "verdict": result.get("verdict", "inconclusive"),
            "confidence": float(result.get("confidence", 0.5)),
            "reasoning": result.get("reasoning", ""),
        }

    except Exception as e:
        # Fallback: rule-based heuristic
        if similarity_score >= 0.92:
            verdict = "piracy"
            reasoning = f"High similarity score ({similarity_score:.3f}) strongly indicates unauthorized reproduction."
        elif similarity_score >= 0.75:
            verdict = "inconclusive"
            reasoning = f"Moderate similarity ({similarity_score:.3f}). Manual review recommended."
        else:
            verdict = "fair_use"
            reasoning = f"Low similarity ({similarity_score:.3f}) suggests transformative or unrelated use."

        return {
            "verdict": verdict,
            "confidence": similarity_score,
            "reasoning": reasoning + f" (Gemini unavailable: {str(e)[:80]})",
        }
