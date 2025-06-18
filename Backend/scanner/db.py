from pymongo import MongoClient
from .config import MONGO_URI, DB_NAME, COLLECTION_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

def insert_scan(entry):
    """Insert one document (new scan)."""
    collection.insert_one(entry)

def upsert_scan(entry):
    """Update or insert scan by domain."""
    collection.update_one(
        {"domain": entry["domain"]},
        {"$set": entry},
        upsert=True
    )
