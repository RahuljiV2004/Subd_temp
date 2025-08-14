import json
from check_renam import OpenAI

# ✅ Your valid key
api_key = "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"

client = OpenAI(api_key=api_key)

def get_risk_score_and_suggestions(subdomain_data):
    prompt = f"""
You are a cybersecurity expert assessing the risk of a subdomain based on scan data. Your task is to analyze the provided subdomain scan results and do the following:

1. Assign a risk score between 0 and 10.
2. Provide a reason for that score.
3. Suggest 3 improvements.
4. Recommend 3 follow-up security tests.

Respond in valid JSON like this:
{{
  "risk_score": <int>,
  "reason": "<brief reason>",
  "suggestions": ["<tip1>", "<tip2>", "<tip3>"],
  "tests": ["<test1>", "<test2>", "<test3>"]
}}

Subdomain data:
{subdomain_data}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500
        )

        raw = response.choices[0].message.content.strip()
        print("🔎 Raw LLM Response:\n", raw)

        return json.loads(raw)

    except Exception as e:
        print("⚠️ Error:", e)
        return {
            "risk_score": -1,
            "reason": "Failed to get a response",
            "suggestions": [],
            "tests": []
        }

# === Test it ===
if __name__ == "__main__":
    fake_data = {
        "subdomain": "dev.example.com",
        "open_ports": [80, 22],
        "technologies": ["Apache 2.4.49", "PHP 7.4.3"],
        "vulnerabilities": ["CVE-2021-41773"]
    }

    print("🔍 Getting risk score...")
    result = get_risk_score_and_suggestions(json.dumps(fake_data, indent=2))
    print(json.dumps(result, indent=2))
