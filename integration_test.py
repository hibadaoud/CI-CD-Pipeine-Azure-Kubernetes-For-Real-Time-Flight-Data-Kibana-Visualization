import time
import requests
import sys

def fail(msg):
    print(f"[FAIL] {msg}")
    sys.exit(1)

def log(msg):
    print(f"[INFO] {msg}")

# 1. Get initial ES doc count
try:
    log("Getting initial Elasticsearch doc count...")
    resp = requests.get('http://docker:9200/esflight/_count', timeout=10)
    resp.raise_for_status()
    initial_count = resp.json().get('count', None)
    log(f"Initial doc count: {initial_count}")
    if initial_count is None:
        fail("Could not get initial ES doc count.")
except Exception as e:
    fail(f"Error getting initial ES doc count: {e}")

# 2. Simulate user registration
try:
    log("Registering test user...")
    register = requests.post('http://docker:3000/register', json={
        "email": "test@test.com",
        "password": "StrongP@ss1"
    }, timeout=10)
    log(f"Register status: {register.status_code}, response: {register.text}")
    if register.status_code not in (200, 201):
        fail(f"Registration failed: {register.text}")
except Exception as e:
    fail(f"Registration request failed: {e}")

# 3. Simulate user login
try:
    log("Logging in test user...")
    login = requests.post('http://docker:3000/login', json={
        "email": "test@test.com",
        "password": "StrongP@ss1"
    }, timeout=10)
    log(f"Login status: {login.status_code}, response: {login.text}")
    if login.status_code != 200:
        fail(f"Login failed: {login.text}")
    token = login.json().get('token', None)
    if not token:
        fail("No token returned from login.")
    log(f"Login succeeded, token: {token[:15]}...")  # Print only part of the token for security
except Exception as e:
    fail(f"Login request failed: {e}")

# 4. Access dashboard (simulate producer trigger)
try:
    log("Accessing dashboard endpoint (triggers producer)...")
    dashboard = requests.get('http://docker:3000/dashboard', headers={
        "Authorization": f"Bearer {token}"
    }, timeout=20)
    log(f"Dashboard status: {dashboard.status_code}, response: {dashboard.text}")
    if dashboard.status_code != 200:
        fail(f"Dashboard failed: {dashboard.text}")
except Exception as e:
    fail(f"Dashboard request failed: {e}")

# 5. Wait for Spark to process and ES to update
log("Waiting 20 seconds for Spark/ES pipeline to process data...")
time.sleep(20)

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
if new_count > initial_count:
    log("Integration test PASS: Data flowed from frontend to ES.")
    sys.exit(0)
else:
    fail("Integration test FAIL: No new data in ES.")
