from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import re
from llm import Llm
from models.gemini import stream_gemini_response, convert_openai_messages_to_gemini
from google.genai import types as gtypes
from google.genai.errors import ClientError
from config import GEMINI_API_KEY

router = APIRouter()

class GenerateRequest(BaseModel):
    stack: str = "react_tailwind"
    image: str  # data URL
    model: Optional[str] = Llm.GEMINI_3_0_PRO_PREVIEW.value
    # Optional OpenAI-style chat history to enable multi-turn conversations
    # Each item should be a dict with keys like {"role": "assistant"|"user", "content": str|list}
    history: Optional[List[Dict[str, Any]]] = []
    sectionSpecs: Optional[List[Dict[str, Any]]] = None

class UpdateRequest(BaseModel):
    stack: str = "react_tailwind"
    currentBundle: Optional[Dict[str, Any]] = None
    currentHtml: Optional[str] = None
    instructions: str
    images: Optional[List[str]] = []
    model: Optional[str] = Llm.GEMINI_3_0_PRO_PREVIEW.value
    # Optional OpenAI-style chat history to enable multi-turn conversations
    history: Optional[List[Dict[str, Any]]] = []
    sectionSpecs: Optional[List[Dict[str, Any]]] = None

class ReactBundle(BaseModel):
    entry: str
    files: List[Dict[str, str]]

SYSTEM_PROMPT = """
You are an expert frontend developer.
Return a strict JSON object matching this schema:
{
  "entry": "index.html",
  "files": [
    { "path": "index.html", "content": "..." },
    { "path": "App.jsx", "content": "..." },
    { "path": "main.jsx", "content": "..." },
    { "path": "components/Header.jsx", "content": "..." }
  ]
}

IMPORTANT:
1. Wrap the JSON object in these sentinels:
###_JSON_START_###
{ ... }
###_JSON_END_###

2. The JSON MUST be strictly valid: no comments, no trailing commas, and all strings JSON-escaped (including newlines as \n).
3. Always include BOTH sentinels and nothing else outside them.
4. Split code into components under components/* with descriptive names.
5. You CAN use JSX and ESM syntax. The code will be transpiled server-side.
6. Use Tailwind CSS via CDN in index.html.
7. Ensure all imports are valid ESM imports (e.g. from 'https://esm.sh/react@18').
8. CRITICAL: Use the provided `section_specs` JSON to structure the app.
   - For each section defined in `section_specs`, create a container element (e.g., <section>, <header>, <footer>).
   - Add `data-section="<SectionName>"` to that container.
   - Use the images provided in `section_specs` for that section.
   - Use the heading text provided in `section_specs` for that section.
"""

def _strip_code_fences(s: str) -> str:
    s = s.strip()
    if s.startswith("```json"):
        s = s[7:]
    if s.startswith("```"):
        s = s[3:]
    if s.endswith("```"):
        s = s[:-3]
    return s.strip()

def _extract_balanced_json(s: str, start_idx: int = 0) -> Optional[str]:
    # Find first '{' from start_idx
    i = s.find('{', start_idx)
    if i == -1:
        return None
    in_string = False
    escape = False
    depth = 0
    result_chars = []
    # Walk from first '{' collecting until depth returns to 0 outside of strings
    for pos in range(i, len(s)):
        ch = s[pos]
        result_chars.append(ch)
        if in_string:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == '"':
                in_string = False
            # ignore any other content while in string
            continue
        else:
            if ch == '"':
                in_string = True
                continue
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    return ''.join(result_chars)
    return None

def _remove_json_comments_and_trailing_commas(s: str) -> str:
    # Remove // and /* */ comments while respecting strings
    out = []
    in_string = False
    escape = False
    i = 0
    while i < len(s):
        ch = s[i]
        nxt = s[i+1] if i + 1 < len(s) else ''
        if in_string:
            out.append(ch)
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == '"':
                in_string = False
            i += 1
            continue
        else:
            if ch == '"':
                in_string = True
                out.append(ch)
                i += 1
                continue
            # line comment
            if ch == '/' and nxt == '/':
                i += 2
                while i < len(s) and s[i] not in ('\n', '\r'):
                    i += 1
                continue
            # block comment
            if ch == '/' and nxt == '*':
                i += 2
                while i + 1 < len(s) and not (s[i] == '*' and s[i+1] == '/'):
                    i += 1
                i += 2 if i + 1 < len(s) else 0
                continue
            out.append(ch)
            i += 1
    s2 = ''.join(out)

    # Remove trailing commas before } or ] while respecting strings
    out2 = []
    in_string = False
    escape = False
    i = 0
    while i < len(s2):
        ch = s2[i]
        if in_string:
            out2.append(ch)
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == '"':
                in_string = False
            i += 1
            continue
        else:
            if ch == '"':
                in_string = True
                out2.append(ch)
                i += 1
                continue
            if ch == ',':
                # look ahead for next non-space
                j = i + 1
                while j < len(s2) and s2[j] in ' \t\r\n':
                    j += 1
                if j < len(s2) and s2[j] in '}]':
                    # skip this comma
                    i += 1
                    continue
            out2.append(ch)
            i += 1
    return ''.join(out2)

def _sanitize_json_string_literals(s: str) -> str:
    """Sanitize JSON strings by escaping control chars and non-standard escapes.

    - Converts raw control chars (0x00-0x1F) inside strings to \\uXXXX
    - Converts non-standard \\xHH to \\u00HH
    - Keeps standard escapes intact
    """
    out: list[str] = []
    in_string = False
    escape = False
    i = 0
    valid_escapes = set('"\\/bfnrtu')
    while i < len(s):
        ch = s[i]
        if in_string:
            if escape:
                # We already emitted the backslash when it was seen
                if ch == 'x':
                    # Try to convert \xHH => \u00HH
                    h1 = s[i + 1] if i + 1 < len(s) else ''
                    h2 = s[i + 2] if i + 2 < len(s) else ''
                    is_hex = lambda c: ('0' <= c <= '9') or ('a' <= c.lower() <= 'f')
                    if is_hex(h1) and is_hex(h2):
                        out.append('u00' + h1 + h2)
                        i += 2
                    else:
                        # Unknown escape, make it a literal backslash + char
                        out.append('\\')
                        out.append(ch)
                elif ch not in valid_escapes:
                    # Unknown escape, escape the backslash itself and keep char
                    out.append('\\')
                    out.append(ch)
                else:
                    out.append(ch)
                escape = False
            else:
                if ch == '"':
                    in_string = False
                    out.append(ch)
                elif ch == '\\':
                    out.append('\\')
                    escape = True
                elif ch == '\n':
                    out.append('\\n')
                elif ch == '\r':
                    out.append('\\r')
                elif ch == '\t':
                    out.append('\\t')
                else:
                    # Escape control chars inside strings
                    if 0 <= ord(ch) <= 0x1F:
                        out.append('\\u%04x' % ord(ch))
                    else:
                        out.append(ch)
        else:
            if ch == '"':
                in_string = True
                out.append(ch)
            else:
                out.append(ch)
        i += 1
    if escape:
        out.append('\\')
    return ''.join(out)

async def generate_bundle(messages: List[Any], model: str) -> ReactBundle:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")

    # Try requested model first, then fall back in preferred order
    preferred_order = [
        Llm.GEMINI_3_0_PRO_PREVIEW.value,
        Llm.GEMINI_2_5_PRO.value,
        Llm.GEMINI_2_5_FLASH.value,
        Llm.GEMINI_2_5_FLASH_LITE.value,
    ]
    # Build candidate list with requested model prioritized
    candidates: List[str] = []
    if model and model not in candidates:
        candidates.append(model)
    for m in preferred_order:
        if m not in candidates:
            candidates.append(m)

    last_error: Optional[Exception] = None
    full_response = ""

    # Define a structured-output schema for the React bundle
    react_bundle_schema = gtypes.Schema(
        type=gtypes.Type.OBJECT,
        required=["entry", "files"],
        properties={
            "entry": gtypes.Schema(type=gtypes.Type.STRING),
            "files": gtypes.Schema(
                type=gtypes.Type.ARRAY,
                items=gtypes.Schema(
                    type=gtypes.Type.OBJECT,
                    required=["path", "content"],
                    properties={
                        "path": gtypes.Schema(type=gtypes.Type.STRING),
                        "content": gtypes.Schema(type=gtypes.Type.STRING),
                    },
                ),
            ),
        },
    )

    # Helper to parse JSON bundle from a raw text
    def _parse_bundle_text(text: str) -> Optional[ReactBundle]:
        cleaned = text.strip()
        MAX_SCAN_LEN = 500_000
        if len(cleaned) > MAX_SCAN_LEN:
            cleaned = cleaned[:MAX_SCAN_LEN]
        start_sentinel = "###_JSON_START_###"
        end_sentinel = "###_JSON_END_###"
        start_idx = cleaned.find(start_sentinel)
        end_idx = cleaned.find(end_sentinel)
        json_str = ""
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            candidate = cleaned[start_idx + len(start_sentinel):end_idx]
            candidate = _strip_code_fences(candidate)
            balanced = _extract_balanced_json(candidate, 0)
            json_str = (balanced or candidate).strip()
        else:
            cleaned2 = _strip_code_fences(cleaned)
            balanced = _extract_balanced_json(cleaned2, 0)
            json_str = (balanced or cleaned2).strip()
        preprocessed = _sanitize_json_string_literals(_remove_json_comments_and_trailing_commas(json_str))
        try:
            data = json.loads(preprocessed)
            return ReactBundle(**data)
        except Exception:
            # Try another balanced attempt on full cleaned text
            candidate2 = _extract_balanced_json(cleaned, 0)
            if candidate2:
                try:
                    data = json.loads(_sanitize_json_string_literals(_remove_json_comments_and_trailing_commas(candidate2)))
                    return ReactBundle(**data)
                except Exception:
                    return None
            return None

    # Try each candidate model; prefer non-streaming full JSON first, then fall back to streaming
    for model_name in candidates:
        try:
            # 1) Non-streaming preferred path for complete JSON
            from google import genai as ggenai
            client = ggenai.Client(api_key=GEMINI_API_KEY)
            sys_instr, contents = convert_openai_messages_to_gemini(messages)
            cfg_kwargs: Dict[str, Any] = {"temperature": 0, "max_output_tokens": 65536}
            if sys_instr:
                cfg_kwargs["system_instruction"] = sys_instr
            cfg_kwargs["response_mime_type"] = "application/json"
            cfg_kwargs["response_schema"] = react_bundle_schema
            # gemini-3.* models require thinking mode with a non-zero budget
            try:
                from llm import Llm as _Llm
                if model_name in (_Llm.GEMINI_3_0_PRO_PREVIEW.value, _Llm.GEMINI_3_0_PRO.value):
                    cfg_kwargs["thinking_config"] = gtypes.ThinkingConfig(thinking_budget=6000, include_thoughts=False)
            except Exception:
                pass
            cfg = gtypes.GenerateContentConfig(**cfg_kwargs)
            try:
                resp = await client.aio.models.generate_content(model=model_name, contents=contents, config=cfg)
                text = getattr(resp, "text", None) or ""
                if not text and resp.candidates and resp.candidates[0].content and resp.candidates[0].content.parts:
                    # Concatenate parts as a fallback
                    for pt in resp.candidates[0].content.parts:
                        if getattr(pt, "text", None):
                            text += pt.text
                        elif getattr(pt, "inline_data", None) and getattr(pt.inline_data, "data", None):
                            import base64 as _b64
                            try:
                                text += _b64.b64decode(pt.inline_data.data).decode("utf-8", errors="ignore")
                            except Exception:
                                pass
                bundle2 = _parse_bundle_text(text)
                if bundle2 is not None:
                    return bundle2
            except Exception as e2:
                last_error = e2
                # fall through to streaming fallback

            # 2) Streaming fallback if non-streaming didn't yield a parseable bundle
            full_response = ""
            async def callback(chunk: str):
                nonlocal full_response
                full_response += chunk
            await stream_gemini_response(
                messages=messages,
                api_key=GEMINI_API_KEY,
                callback=callback,
                model_name=model_name,
                response_mime_type="application/json",
                response_schema=react_bundle_schema,
            )
            bundle = _parse_bundle_text(full_response)
            if bundle is not None:
                return bundle
        except ClientError as e:
            if 'NOT_FOUND' in str(e) or 'is not found' in str(e):
                last_error = e
                continue
            last_error = e
        except Exception as e:
            last_error = e
            continue

    # If we reach here, all attempts failed. Dump last full_response if available.
    cleaned = full_response.strip()
    try:
        import os
        from pathlib import Path
        dbg_dir = Path(__file__).resolve().parent.parent / 'debug'
        os.makedirs(dbg_dir, exist_ok=True)
        with open(dbg_dir / 'last_model_output.txt', 'w', encoding='utf-8') as f:
            f.write(cleaned)
    except Exception:
        pass
    snippet = cleaned[:800]
    raise HTTPException(status_code=500, detail=f"Failed to parse JSON bundle from model output. Length: {len(cleaned)}. Snippet: {snippet}")

@router.post("/api/generate-from-image")
async def generate_from_image(req: GenerateRequest):
    # Send the prompt as system instruction and the image + request as user content
    messages: List[Dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
    ]
    # Include prior history if provided to keep the same conversation]
    if req.history:
        messages.extend(req.history)
    messages.append({
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": req.image}},
            {"type": "text", "text": "Generate a React app based on this image."},
        ]
    })
    
    if req.sectionSpecs:
        messages[-1]["content"].append({
            "type": "text", 
            "text": f"\n\nHere are the Section Specs (use these images and headings, and apply data-section attributes):\n```json\n{json.dumps(req.sectionSpecs, indent=2)}\n```"
        })

    bundle = await generate_bundle(messages, req.model)
    return {"bundle": bundle.dict(), "model": req.model}

@router.post("/api/update-from-diff")
async def update_from_diff(req: UpdateRequest):
    # Construct context from current bundle
    context_text = ""
    if req.currentBundle:
        for f in req.currentBundle.get("files", []):
            context_text += f"--- {f['path']} ---\n{f['content']}\n\n"
    elif req.currentHtml:
        context_text = req.currentHtml

    if not req.images or len(req.images) == 0:
        raise HTTPException(status_code=400, detail="At least one image (base/target/diff) is required for update.")

    messages: List[Dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
    ]
    # Inject conversation history first so the last message is the new instruction
    if req.history:
        messages.extend(req.history)
    messages.append({
        "role": "user",
        "content": (
            [
                {"type": "text", "text": "Update the following code based on the instructions and diffs provided. You may return a partial bundle containing ONLY the files that need to be changed or created. Unchanged files will be preserved automatically."},
                *([{"type": "text", "text": f"Current Code:\n{context_text}"}] if context_text else []),
                {"type": "text", "text": f"Instructions:\n{req.instructions}"},
            ]
            + ([{"type": "image_url", "image_url": {"url": img}} for img in req.images] if req.images else [])
        )
    })

    if req.sectionSpecs:
        messages[-1]["content"].append({
            "type": "text", 
            "text": f"\n\nHere are the Section Specs (use these images and headings, and apply data-section attributes):\n```json\n{json.dumps(req.sectionSpecs, indent=2)}\n```"
        })

    bundle = await generate_bundle(messages, req.model)
    return {"bundle": bundle.dict(), "model": req.model}
