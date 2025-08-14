# # scanner_tasks.py
# from celery import shared_task
# from utils.scanner_task_runner import run_scan_once
# from pymongo import MongoClient

# client = MongoClient("mongodb://localhost:27017/")
# db = client["subdomain_scanner"]
# collection = db["results"]

# @shared_task(name="periodic_subdomain_scan")
# def periodic_subdomain_scan():
#     domain = "iitm.ac.in"
#     return run_scan_once(domain, collection)
