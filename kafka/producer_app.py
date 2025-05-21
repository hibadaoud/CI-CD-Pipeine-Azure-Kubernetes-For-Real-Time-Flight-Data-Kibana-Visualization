from confluent_kafka import Producer
import requests
import json
import time
from dotenv import load_dotenv
import os

def produce_from_api():
    load_dotenv()
    producer = Producer({'bootstrap.servers': 'kafka:9092'})
    api_url = os.getenv('API_URL')

    def delivery_report(err, msg):
        if err is not None:
            print(f"[ERROR] Message delivery failed: {err}", flush=True)
        else:
            print(f"[INFO] Message delivered to {msg.topic()} [{msg.partition()}]", flush=True)

    print("[INFO] Fetching data from API...", flush=True)
    try:
        response = requests.get(api_url, timeout=10)
    except requests.exceptions.Timeout:
        print("[ERROR] API request timed out!", flush=True)
        # Exit with error code so Node can handle it as an error
        exit(1)
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] API request failed: {e}", flush=True)
        exit(1)

    # Only print this line if status is 200 (for Node.js to watch)
    if response.status_code == 200:
        print(f"[INFO] API responded with status: 200", flush=True)
        print(f"[INFO] Received {len(response.json().get('response', []))} items.", flush=True)
        data = response.json().get("response", [])

        for i, obj in enumerate(data):
            producer.produce('flights', key=str(obj.get('hex', '')), value=json.dumps(obj), callback=delivery_report)
            if i == 0:
                print("[INFO] First Kafka message sent", flush=True)
            time.sleep(0.01)  # Prevent overwhelming Kafka

        producer.flush()
        print("[INFO] All messages sent successfully.", flush=True)
        exit(0)  # Successful run
    else:
        print(f"[ERROR] Failed to fetch data (Status Code: {response.status_code})", flush=True)
        exit(1)  # Error code so Node knows there was a failure

if __name__ == "__main__":
    produce_from_api()
