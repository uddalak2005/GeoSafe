import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from utils.stream_processor import StreamProcessor
import cv2
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile
import numpy as np

app = FastAPI(title="Helmet Detector API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
processor = StreamProcessor()

class FramePayload(BaseModel):
    frame: str  # base64 encoded image

@app.get("/")
def read_root():
    return {"message": "Helmet Detector API is running"}


@app.post("/detect")
async def detect_helmet(frame: UploadFile = File(...)):
    data = await frame.read()

    # Convert bytes → OpenCV image
    np_arr = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    detections = processor.process_frame(frame)
    if len(detections) > 0:    
        return {
            "persons_detected": len(detections),
            "results": detections
        }
    else:
        return {
            "persons_detected": 0,
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
