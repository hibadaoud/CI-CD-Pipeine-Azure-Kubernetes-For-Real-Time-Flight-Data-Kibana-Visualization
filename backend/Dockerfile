# Use a smaller base image
FROM node:18-slim

# Install Python and dependencies only if needed
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-setuptools python3-dev libssl-dev libsasl2-dev && \
    python3 -m pip install --upgrade pip && \
    python3 -m pip install requests confluent_kafka python-dotenv && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set a non-root user for security
RUN useradd --user-group --create-home --shell /bin/false appuser
WORKDIR /app

COPY backend/package*.json ./
RUN npm install

# Copy the rest of the code
COPY backend ./
COPY kafka/producer_app.py ./

# Change permissions for the app directory
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["npm", "run", "start"]

# CMD ["npm", "run", "dev"]
