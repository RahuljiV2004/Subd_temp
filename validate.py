import openai  # ✅ The real OpenAI library

def check_api_key(api_key: str) -> bool:
    client = openai.OpenAI(api_key=api_key)  # ✅ Reference 'openai', not your script
    try:
        client.models.list()
    except openai.AuthenticationError:
        return False
    except Exception:
        return True
    return True

# Paste your actual API key here
key = "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"
print("✅ Valid key?", check_api_key(key))
