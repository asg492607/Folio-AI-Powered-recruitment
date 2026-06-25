#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install -r requirements.txt
PLAYWRIGHT_BROWSERS_PATH=0 playwright install chromium
