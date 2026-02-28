import base64
import numpy as np
import cv2
import os
from ultralytics import YOLO

class StreamProcessor:
    def __init__(self):
        self.model = self.load_model()
        self.class_names = self.model.names

    def load_model(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "models", "helmet_detector", "helmet_detection_YOLOv8.pt")
        model = YOLO(model_path)
        return model

    def decode_base64_image(self, base64_str: str):
        image_bytes = base64.b64decode(base64_str)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return image

    def iou(self, boxA, boxB):
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])

        inter = max(0, xB - xA) * max(0, yB - yA)
        areaA = max(0, boxA[2] - boxA[0]) * max(0, boxA[3] - boxA[1])
        areaB = max(0, boxB[2] - boxB[0]) * max(0, boxB[3] - boxB[1])

        union = areaA + areaB - inter
        return inter / union if union > 0 else 0
    
    def process_frame(self, frame, conf_thresh=0.2):
        results = self.model(frame, conf=conf_thresh)[0]

        heads = []
        helmets = []

        for box in results.boxes:
            cls_id = int(box.cls.item())
            cls = self.class_names[cls_id].lower()
            conf = float(box.conf.item())

            if cls == "head" and conf >= conf_thresh:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                heads.append((x1, y1, x2, y2))

            elif cls == "helmet" and conf >= 0.4:  # stricter helmet confidence
                x1, y1,  hx2, y2 = map(int, box.xyxy[0].tolist())
                helmets.append((x1, y1, x2, y2))

        detections = []

        for hx1, hy1,x2, hy2 in heads:
            head_w = hx2 - hx1
            head_h = hy2 - hy1
            head_area = head_w * head_h

        has_helmet = False

        for px1, py1, px2, py2 in helmets:
            # containment (helmet inside head)
            if px1 < hx1 - 0.1 * head_w or px2 > hx2 + 0.1 * head_w:
                continue
            if py1 < hy1 - 0.1 * head_h or py2 > hy2 + 0.1 * head_h:
                continue

            # helmet must be in upper portion of head
            helmet_center_y = (py1 + py2) / 2
            if helmet_center_y > hy1 + 0.6 * head_h:
                continue

            # size sanity check
            helmet_area = (px2 - px1) * (py2 - py1)
            area_ratio = helmet_area / head_area

            if 0.08 <= area_ratio <= 0.5:
                has_helmet = True
                break

        detections.append({
            "bbox": (hx1, hy1, hx2, hy2),
            "helmet": has_helmet
        })

        return detections

