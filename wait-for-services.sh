#!/bin/sh

# List of services to check (space-separated string)
SERVICES="spark-master spark-worker-1 spark-worker-2 zookeeper-cntr kafka-cntr elasticsearch-cntr kibana-cntr mongo-cntr backend-cntr frontend-cntr spark-job-submit"

TIMEOUT=300   # seconds, adjust for your stack
SLEEP=5       # seconds between checks

echo "Waiting for services to be healthy..."

START_ALL=$(date +%s)

for SERVICE in $SERVICES; do
  SERVICE_START=$(date +%s)
  while true; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$SERVICE" 2>/dev/null)
    NOW=$(date +%s)
    ELAPSED_TOTAL=$((NOW - START_ALL))
    ELAPSED_SERVICE=$((NOW - SERVICE_START))
    if [ "$STATUS" = "healthy" ]; then
      echo "$SERVICE is healthy! (Total elapsed: ${ELAPSED_TOTAL}s | Service wait: ${ELAPSED_SERVICE}s)"
      break
    fi
    if [ "$STATUS" = "unhealthy" ]; then
      echo "$SERVICE is unhealthy! Failing..."
      exit 1
    fi
    if [ -z "$STATUS" ]; then
      RUNNING=$(docker inspect --format='{{.State.Running}}' "$SERVICE" 2>/dev/null)
      if [ "$RUNNING" = "true" ]; then
        echo "$SERVICE is running (no healthcheck defined). (Total elapsed: ${ELAPSED_TOTAL}s | Service wait: ${ELAPSED_SERVICE}s)"
        break
      fi
    fi
    if [ "$ELAPSED_TOTAL" -ge "$TIMEOUT" ]; then
      echo "Timeout waiting for $SERVICE to become healthy."
      exit 1
    fi
    sleep $SLEEP
  done
done

echo "All services are healthy!"
exit 0
