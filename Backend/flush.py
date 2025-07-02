import redis

try:
    r = redis.Redis(host='localhost', port=6379, db=0)
    r.flushdb()
    print("✅ Redis DB flushed successfully.")
except Exception as e:
    print(f"❌ Failed to flush Redis: {e}")
