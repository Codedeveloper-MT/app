# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from detector import Detector
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize detector
detector = None
try:
    detector = Detector()
    logger.info("Detector initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize detector: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify service status"""
    return jsonify({
        'status': 'healthy',
        'detector_ready': detector is not None,
        'tesseract_available': hasattr(detector, 'detect_text') if detector else False,
        'yolo_available': hasattr(detector, 'detect_objects_yolo') if detector else False
    })

@app.route('/detect', methods=['POST'])
def detect():
    if not detector:
        return jsonify({
            'success': False,
            'error': 'Detection service not initialized'
        }), 503
        
    try:
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON'
            }), 400

        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'No image data provided'
            }), 400

        # Remove data URL prefix if present
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        # Process image
        results = detector.process_image(image_data)
        
        return jsonify(results)

    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)