from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Mock ML model - In production, load actual trained model
class EquipmentRecommender:
    def __init__(self):
        # Equipment recommendation rules based on farm stage and crop type
        self.recommendations = {
            'land-preparation': {
                'wheat': ['tractor', 'cultivator'],
                'rice': ['tractor', 'cultivator'],
                'corn': ['tractor', 'cultivator'],
                'cotton': ['tractor', 'cultivator'],
                'sugarcane': ['tractor', 'cultivator'],
                'potato': ['tractor', 'cultivator'],
            },
            'sowing': {
                'wheat': ['planter', 'tractor'],
                'rice': ['planter', 'tractor'],
                'corn': ['planter', 'tractor'],
                'cotton': ['planter', 'tractor'],
                'sugarcane': ['planter', 'tractor'],
                'potato': ['planter', 'tractor'],
            },
            'maintenance': {
                'wheat': ['sprayer', 'tractor'],
                'rice': ['sprayer', 'tractor'],
                'corn': ['sprayer', 'tractor'],
                'cotton': ['sprayer', 'tractor'],
                'sugarcane': ['sprayer', 'tractor'],
                'potato': ['sprayer', 'tractor'],
            },
            'harvesting': {
                'wheat': ['harvester', 'tractor'],
                'rice': ['harvester', 'tractor'],
                'corn': ['harvester', 'tractor'],
                'cotton': ['harvester', 'tractor'],
                'sugarcane': ['harvester', 'tractor'],
                'potato': ['harvester', 'tractor'],
            },
            'post-harvest': {
                'wheat': ['tractor', 'sprayer'],
                'rice': ['tractor', 'sprayer'],
                'corn': ['tractor', 'sprayer'],
                'cotton': ['tractor', 'sprayer'],
                'sugarcane': ['tractor', 'sprayer'],
                'potato': ['tractor', 'sprayer'],
            }
        }
    
    def predict(self, crop_type, farm_stage, crop_weight):
        """
        Predict best equipment based on farming parameters
        
        Args:
            crop_type (str): Type of crop
            farm_stage (str): Current farming stage
            crop_weight (str): Expected crop weight
            
        Returns:
            dict: Recommended equipment types with confidence scores
        """
        # Get base recommendations
        recommended_types = self.recommendations.get(
            farm_stage, {}
        ).get(crop_type, ['tractor', 'harvester', 'planter', 'sprayer'])
        
        # Calculate confidence based on crop weight (mock logic)
        confidence = 0.85
        if crop_weight:
            try:
                weight_value = float(crop_weight.split()[0])
                if weight_value > 1000:
                    confidence = 0.92
                elif weight_value > 500:
                    confidence = 0.88
            except:
                pass
        
        # Generate feature importance (mock)
        feature_importance = {
            'crop_type': 0.35,
            'farm_stage': 0.45,
            'crop_weight': 0.20
        }
        
        return {
            'recommended_types': recommended_types,
            'confidence': confidence,
            'feature_importance': feature_importance,
            'alternative_types': ['cultivator', 'other']
        }

# Initialize model
model = EquipmentRecommender()

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'AgriGo ML API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Equipment recommendation endpoint
    
    Expected JSON payload:
    {
        "cropType": "wheat",
        "farmStage": "land-preparation",
        "cropWeight": "1000 kg"
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        crop_type = data.get('cropType', '').lower()
        farm_stage = data.get('farmStage', '').lower()
        crop_weight = data.get('cropWeight', '')
        
        if not crop_type or not farm_stage:
            return jsonify({
                'success': False,
                'error': 'cropType and farmStage are required fields'
            }), 400
        
        # Get predictions
        predictions = model.predict(crop_type, farm_stage, crop_weight)
        
        # Return response
        return jsonify({
            'success': True,
            'recommendedTypes': predictions['recommended_types'],
            'confidence': predictions['confidence'],
            'message': f'Based on {crop_type} at {farm_stage} stage, we recommend these equipment types',
            'metadata': {
                'cropType': crop_type,
                'farmStage': farm_stage,
                'cropWeight': crop_weight,
                'modelVersion': '1.0',
                'timestamp': datetime.now().isoformat(),
                'featureImportance': predictions['feature_importance'],
                'alternativeTypes': predictions['alternative_types']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'recommendedTypes': ['tractor', 'harvester', 'planter', 'sprayer']
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check for monitoring"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the ML model"""
    return jsonify({
        'model_type': 'Rule-Based Recommender',
        'version': '1.0.0',
        'supported_crops': ['wheat', 'rice', 'corn', 'cotton', 'sugarcane', 'potato'],
        'supported_stages': ['land-preparation', 'sowing', 'maintenance', 'harvesting', 'post-harvest'],
        'equipment_types': ['tractor', 'harvester', 'planter', 'sprayer', 'cultivator'],
        'training_date': '2024-01-01',
        'accuracy': 0.85
    })

if __name__ == '__main__':
    # Run on port 5000 for development
    # In production, use gunicorn or similar WSGI server
    app.run(host='0.0.0.0', port=5000, debug=True)
