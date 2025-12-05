import base64
import time
from typing import Awaitable, Callable, Dict, List, Any, Optional
from openai.types.chat import ChatCompletionMessageParam
from google import genai
from google.genai import types
from llm import Completion, Llm


def convert_openai_messages_to_gemini(
    messages: List[ChatCompletionMessageParam],
) -> tuple[Optional[types.Content], List[types.Content]]:
    """
    Converts OpenAI-style messages to Gemini's format.

    Args:
        messages: List of ChatCompletionMessageParam

    Returns:
        Tuple of (system_instruction, contents)
    """
    system_instruction: Optional[types.Content] = None
    contents: List[types.Content] = []

    for msg in messages:
        role = msg["role"]
        content = msg["content"]

        if role == "system":
            # Gemini supports a single system instruction.
            # If multiple are present, we'll concatenate them or just take the first.
            # Here we'll just take the text.
            if isinstance(content, str):
                if system_instruction is None:
                    system_instruction = types.Content(
                        parts=[types.Part(text=content)]
                    )
                else:
                    # Append to existing system instruction
                    system_instruction.parts.append(types.Part(text=content))
            continue

        gemini_role = "user" if role == "user" else "model"
        parts: List[types.Part] = []

        if isinstance(content, str):
            parts.append(types.Part(text=content))
        elif isinstance(content, list):
            for part in content:
                if part["type"] == "text":
                    parts.append(types.Part(text=part["text"]))
                elif part["type"] == "image_url":
                    image_url = part["image_url"]["url"]
                    if image_url.startswith("data:"):
                        # Extract base64 data and mime type
                        try:
                            header, base64_data = image_url.split(",", 1)
                            mime_type = header.split(";")[0].split(":")[1]
                            parts.append(
                                types.Part.from_bytes(
                                    data=base64.b64decode(base64_data),
                                    mime_type=mime_type,
                                )
                            )
                        except Exception as e:
                            print(f"Error parsing data URL: {e}")
                    else:
                        # For remote URLs, we might need to fetch them or pass as URI if supported
                        # The documentation suggests uploading files or passing inline data.
                        # For now, we'll assume we can't easily pass remote URLs directly without downloading
                        # unless we use the file API.
                        # As a fallback/placeholder:
                        parts.append(types.Part(text=f"[Image: {image_url}]"))

        if parts:
            contents.append(types.Content(role=gemini_role, parts=parts))

    return system_instruction, contents


async def stream_gemini_response(
    messages: List[ChatCompletionMessageParam],
    api_key: str,
    callback: Callable[[str], Awaitable[None]],
    model_name: str,
    *,
    response_mime_type: str | None = None,
    response_schema: types.Schema | None = None,
) -> Completion:
    start_time = time.time()

    system_instruction, contents = convert_openai_messages_to_gemini(messages)

    client = genai.Client(api_key=api_key)
    full_response = ""

    # Configure the model
    config_kwargs: dict[str, Any] = {
        "temperature": 0,
        "max_output_tokens": 65536,
    }

    if system_instruction:
        config_kwargs["system_instruction"] = system_instruction

    if model_name == Llm.GEMINI_2_5_FLASH_PREVIEW_05_20.value:
        # Gemini 2.5 Flash supports thinking budgets
        config_kwargs["max_output_tokens"] = 65536
        config_kwargs["thinking_config"] = types.ThinkingConfig(
            thinking_budget=5000, include_thoughts=True
        )
    elif model_name in (Llm.GEMINI_3_0_PRO_PREVIEW.value, Llm.GEMINI_3_0_PRO.value):
        # gemini-3.* models require thinking mode with a non-zero budget
        config_kwargs["max_output_tokens"] = 65536
        config_kwargs["thinking_config"] = types.ThinkingConfig(
            thinking_budget=6000, include_thoughts=False
        )

    # Structured output configuration (optional)
    if response_mime_type:
        config_kwargs["response_mime_type"] = response_mime_type
    if response_schema is not None:
        config_kwargs["response_schema"] = response_schema

    config = types.GenerateContentConfig(**config_kwargs)

    max_retries = 3
    retry_delay = 2  # seconds

    for attempt in range(max_retries):
        try:
            stream = await client.aio.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=config,
            )
            async for chunk in stream:
                # Prefer SDK-provided incremental text which handles both plain and structured outputs
                chunk_text = getattr(chunk, "text", None)
                if chunk_text:
                    full_response += chunk_text
                    await callback(chunk_text)
                    continue

                # Fallback: accumulate from parts
                # FIXED: Added check for .parts not being None
                if (
                    chunk.candidates
                    and len(chunk.candidates) > 0
                    and chunk.candidates[0].content
                    and getattr(chunk.candidates[0].content, "parts", None)
                ):
                    for part in chunk.candidates[0].content.parts:
                        # Inline data (e.g., when using response_mime_type) can appear here
                        if getattr(part, "inline_data", None) and getattr(part.inline_data, "data", None):
                            try:
                                text = base64.b64decode(part.inline_data.data).decode("utf-8", errors="ignore")
                            except Exception:
                                text = ""
                            if text:
                                full_response += text
                                await callback(text)
                                continue
                        # Thought parts for thinking models
                        if getattr(part, "thought", False):
                            # ignore thoughts for output assembly
                            continue
                        # Regular text parts
                        if getattr(part, "text", None):
                            full_response += part.text
                            await callback(part.text)
            # If we get here, streaming completed successfully
            break

        except Exception as e:
            error_str = str(e)
            is_retryable = (
                "503" in error_str or 
                "UNAVAILABLE" in error_str or 
                "timed out" in error_str.lower() or
                "timeout" in error_str.lower()
            )

            if is_retryable and attempt < max_retries - 1:
                print(f"Gemini API error (attempt {attempt + 1}/{max_retries}), retrying in {retry_delay}s: {e}")
                import asyncio
                await asyncio.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
                continue
            else:
                print(f"Error calling Gemini API: {e}")
                raise

    completion_time = time.time() - start_time
    return {"duration": completion_time, "code": full_response}
