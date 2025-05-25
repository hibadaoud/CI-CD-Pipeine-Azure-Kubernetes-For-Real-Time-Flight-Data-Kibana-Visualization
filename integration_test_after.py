import time
import requests
import sys

def fail(msg):
    print(f"[FAIL] {msg}")
    sys.exit(1)

def log(msg):
    print(f"[INFO] {msg}")

time.sleep(120)

# 6. Get new doc count
try:
    log("Getting new Elasticsearch doc count...")
    resp = requests.get('http://docker:9200/esflight/_count', timeout=10)
    resp.raise_for_status()
    new_count = resp.json().get('count', None)
    log(f"New doc count: {new_count}")
    if new_count is None:
        fail("Could not get new ES doc count.")
except Exception as e:
    fail(f"Error getting new ES doc count: {e}")

# 7. Pass or fail
if new_count > 0:
    log("Integration test PASS: Data flowed from frontend to ES.")
    sys.exit(0)
else:
    fail("Integration test FAIL: No new data in ES.")