@echo off
echo Starting Saradakosh Local Server...
start http://localhost:8000
python -m http.server 8000 -d webapp
