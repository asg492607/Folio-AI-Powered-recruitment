#!/bin/bash
set -e

echo "Starting monolithic build process..."

# Build Frontends
echo "Building React applications..."
cd folio
npm install
npm run build:candidate
npm run build:recruiter
cd ..

# Install Backend Dependencies
echo "Installing Python dependencies..."
cd unified_backend
pip install -r requirements.txt
cd ..

echo "Build process completed successfully!"
