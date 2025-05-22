# Use a smaller base image
FROM node:18

# Install Python and dependencies only if needed
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-setuptools libssl-dev libsasl2-dev python3.11-venv && \
    python3 -m venv python_env && \
    python_env/bin/pip install requests confluent_kafka python-dotenv && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set a non-root user with no acces to shell for production
# RUN useradd --user-group --create-home --shell /bin/false appuser

#for development
RUN useradd --user-group --create-home --shell /bin/bash appuser
WORKDIR /app

# Change permissions for the app directory
RUN chown -R appuser:appuser /app

COPY backend/package*.json ./
RUN npm install

# Copy the rest of the code
COPY backend ./ 
COPY kafka/producer_app.py ./

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["npm", "run", "start"]

# CMD ["npm", "run", "dev"]
