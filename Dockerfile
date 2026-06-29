# ==========================================
# STAGE 1: Build React Frontends
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY folio/ ./folio/

# Build Candidate and Recruiter SPAs
WORKDIR /app/folio
# Clean install relying on package-lock.json
RUN npm install
RUN npm run build:candidate
RUN npm run build:recruiter

# ==========================================
# STAGE 2: Python Backend & Unified Server
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Copy the built React apps from the builder stage
COPY --from=frontend-builder /app/folio/apps/candidate/dist ./folio/apps/candidate/dist
COPY --from=frontend-builder /app/folio/apps/recruiter/dist ./folio/apps/recruiter/dist

# Copy the backend code
COPY unified_backend/ ./unified_backend/

# Install Python Dependencies
WORKDIR /app/unified_backend
RUN pip install --no-cache-dir -r requirements.txt

# Render exposes the port in the PORT environment variable
ENV PORT=10000

# Start FastAPI Server (which serves the API + React static files)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
