Drop YOUR files here (they are the AI backend as-is, nothing was changed):

    api.py  crop_check.py  fire_check.py  llm.py
    models/ppe/best.pt    models/fire/best.pt

    pip install -r requirements.txt
    uvicorn api:app --host 0.0.0.0 --port 8000

Optional second check with a local vision-LLM:  LLM_BACKEND=ollama OLLAMA_MODEL=qwen2.5vl:3b
The Node backend calls /analyze/image, /analyze/ppe, /analyze/fire and /analyze/video.
