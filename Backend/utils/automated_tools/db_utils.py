from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["subdomain_scanner"]
collection = db["scan_results_subfinder"]  # ✅ Correct collectio
# Append result inside "scans" array of a document
def append_tool_result(scan_id, tool_name, command, output):
    collection.update_one(
        {"_id": ObjectId(scan_id)},
        {
            "$push": {
                "scans": {
                    "tool": tool_name,
                    "command": command,
                    "output": output,
                    "timestamp": datetime.utcnow()
                }
            }
        }
    )
