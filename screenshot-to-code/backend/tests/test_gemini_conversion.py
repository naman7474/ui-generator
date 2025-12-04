import sys
import os
import base64
from typing import List, Any
from unittest.mock import MagicMock

# Mock external dependencies
sys.modules["openai"] = MagicMock()
sys.modules["openai.types.chat"] = MagicMock()
sys.modules["google"] = MagicMock()
sys.modules["google.genai"] = MagicMock()
sys.modules["anthropic"] = MagicMock()
sys.modules["PIL"] = MagicMock()
sys.modules["PIL.Image"] = MagicMock()

# Define mock classes for google.genai.types
class MockPart:
    def __init__(self, text=None, inline_data=None):
        self.text = text
        self.inline_data = inline_data

    @classmethod
    def from_bytes(cls, data, mime_type):
        return cls(inline_data={"data": data, "mime_type": mime_type})

class MockContent:
    def __init__(self, role=None, parts=None):
        self.role = role
        self.parts = parts or []

class MockThinkingConfig:
    def __init__(self, thinking_budget=None, include_thoughts=None):
        self.thinking_budget = thinking_budget
        self.include_thoughts = include_thoughts

class MockGenerateContentConfig:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

# Setup the mock module structure
mock_genai = sys.modules["google.genai"]
mock_genai.types.Part = MockPart
mock_genai.types.Content = MockContent
mock_genai.types.ThinkingConfig = MockThinkingConfig
mock_genai.types.GenerateContentConfig = MockGenerateContentConfig

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the function to test
# We need to make sure llm is also mockable or available
sys.modules["llm"] = MagicMock()
from models.gemini import convert_openai_messages_to_gemini

def test_system_instruction_extraction():
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello"},
    ]
    
    system_instruction, contents = convert_openai_messages_to_gemini(messages)
    
    assert system_instruction is not None
    assert len(system_instruction.parts) == 1
    assert system_instruction.parts[0].text == "You are a helpful assistant."
    
    assert len(contents) == 1
    assert contents[0].role == "user"
    assert contents[0].parts[0].text == "Hello"

def test_multi_turn_conversation():
    messages = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"},
        {"role": "user", "content": "How are you?"},
    ]
    
    system_instruction, contents = convert_openai_messages_to_gemini(messages)
    
    assert system_instruction is None
    assert len(contents) == 3
    assert contents[0].role == "user"
    assert contents[0].parts[0].text == "Hello"
    assert contents[1].role == "model"
    assert contents[1].parts[0].text == "Hi there!"
    assert contents[2].role == "user"
    assert contents[2].parts[0].text == "How are you?"

def test_image_handling():
    # Create a small dummy base64 image
    dummy_data = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    data_url = f"data:image/gif;base64,{dummy_data}"
    
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is this?"},
                {"type": "image_url", "image_url": {"url": data_url}},
            ],
        }
    ]
    
    system_instruction, contents = convert_openai_messages_to_gemini(messages)
    
    assert len(contents) == 1
    assert contents[0].role == "user"
    assert len(contents[0].parts) == 2
    assert contents[0].parts[0].text == "What is this?"
    
    # Check image part
    image_part = contents[0].parts[1]
    assert image_part is not None
    assert image_part.inline_data["mime_type"] == "image/gif"
    # We can check if data is bytes
    assert isinstance(image_part.inline_data["data"], bytes)

def test_mixed_content_and_system():
    messages = [
        {"role": "system", "content": "System prompt"},
        {"role": "user", "content": "User 1"},
        {"role": "assistant", "content": "Model 1"},
        {"role": "user", "content": "User 2"},
    ]
    
    system_instruction, contents = convert_openai_messages_to_gemini(messages)
    
    assert system_instruction is not None
    assert system_instruction.parts[0].text == "System prompt"
    assert len(contents) == 3
    assert contents[0].role == "user"
    assert contents[1].role == "model"
    assert contents[2].role == "user"

if __name__ == "__main__":
    try:
        test_system_instruction_extraction()
        print("test_system_instruction_extraction passed")
        test_multi_turn_conversation()
        print("test_multi_turn_conversation passed")
        test_image_handling()
        print("test_image_handling passed")
        test_mixed_content_and_system()
        print("test_mixed_content_and_system passed")
        print("All tests passed!")
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
