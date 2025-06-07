import torch
from ultralytics import YOLO
import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
import base64
import os
from functools import lru_cache

class Detector:
    def __init__(self):
        # Try to find Tesseract installation
        if os.name == 'nt':  # Windows
            tesseract_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            ]
            for path in tesseract_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.tesseract_cmd = path
                    break
        
        # Initialize YOLO with caching
        self.yolo_model = self._load_yolo_model()
        
    @lru_cache(maxsize=1)
    def _load_yolo_model(self):
        return YOLO('yolov8n.pt')

    def process_image(self, image_data):
        try:
            # Convert base64 to image
            image = Image.open(io.BytesIO(base64.b64decode(image_data)))
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

            results = {
                'yolo': self.detect_objects_yolo(opencv_image),
                'opencv': self.process_opencv(opencv_image),
                'ocr': self.detect_text(image),
                'success': True,
                'error': None
            }
        except Exception as e:
            results = {
                'success': False,
                'error': str(e),
                'yolo': [],
                'opencv': [],
                'ocr': {'text': '', 'boxes': []}
            }

        return results

    def detect_objects_yolo(self, image):
        try:
            results = self.yolo_model(image)
            detections = []
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    confidence = box.conf[0].item()
                    class_id = box.cls[0].item()
                    class_name = result.names[class_id]
                    
                    detections.append({
                        'class': class_name,
                        'confidence': round(confidence, 3),
                        'bbox': [round(x, 2) for x in [x1, y1, x2, y2]]
                    })
            
            return detections
        except Exception as e:
            print(f"YOLO detection error: {e}")
            return []

    def process_opencv(self, image):
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Edge detection with automatic threshold
            median = np.median(gray)
            lower = int(max(0, (1.0 - 0.33) * median))
            upper = int(min(255, (1.0 + 0.33) * median))
            edges = cv2.Canny(gray, lower, upper)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Process contours
            shapes = []
            min_area = 100  # Minimum area to consider
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area < min_area:
                    continue
                    
                # Get approximate shape
                peri = cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, 0.04 * peri, True)
                
                # Get shape metrics
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = float(w)/h if h != 0 else 0
                
                # Determine shape type
                vertices = len(approx)
                if vertices == 3:
                    shape_type = "triangle"
                elif vertices == 4:
                    # Check if it's a square or rectangle
                    if 0.95 <= aspect_ratio <= 1.05:
                        shape_type = "square"
                    else:
                        shape_type = "rectangle"
                elif vertices == 5:
                    shape_type = "pentagon"
                elif vertices == 6:
                    shape_type = "hexagon"
                elif vertices >= 8:
                    # Check circularity
                    circularity = 4 * np.pi * area / (peri * peri) if peri != 0 else 0
                    if circularity > 0.8:
                        shape_type = "circle"
                    else:
                        shape_type = "polygon"
                else:
                    shape_type = "unknown"
                
                shapes.append({
                    'type': shape_type,
                    'points': approx.reshape(-1, 2).tolist(),
                    'area': round(area, 2),
                    'center': [round(x + w/2, 2), round(y + h/2, 2)]
                })
            
            return shapes
        except Exception as e:
            print(f"Shape detection error: {e}")
            return []

    def detect_text(self, image):
        try:
            # OCR using Tesseract
            text = pytesseract.image_to_string(image)
            
            # Get bounding boxes for text
            boxes = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            
            text_results = []
            n_boxes = len(boxes['text'])
            for i in range(n_boxes):
                if int(boxes['conf'][i]) > 60 and boxes['text'][i].strip():  # Filter empty text
                    text_results.append({
                        'text': boxes['text'][i],
                        'confidence': boxes['conf'][i],
                        'bbox': [
                            boxes['left'][i],
                            boxes['top'][i],
                            boxes['left'][i] + boxes['width'][i],
                            boxes['top'][i] + boxes['height'][i]
                        ]
                    })
            
            return {
                'full_text': text,
                'text_boxes': text_results
            }
        except Exception as e:
            print(f"OCR error: {e}")
            return {
                'full_text': '',
                'text_boxes': []
            }