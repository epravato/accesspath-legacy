import base64
import anthropic


async def describe_image_bytes(image_bytes: bytes, media_type: str, context: str,
                                ai: anthropic.AsyncAnthropic) -> str:
    b64 = base64.standard_b64encode(image_bytes).decode()
    msg = await ai.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[{"role": "user", "content": [
            {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64}},
            {"type": "text", "text": (
                f"Write a concise alt-text description for a student with visual impairment. "
                f"Context: {context[:150]}. Description only, no preamble."
            )},
        ]}],
    )
    text = msg.content[0].text.strip()
    for prefix in ["# Alt-text:", "Alt-text:", "**Alt text:**", "Alt text:", "**Alt-text:**"]:
        if text.lower().startswith(prefix.lower()):
            text = text[len(prefix):].strip()
            break
    return text
