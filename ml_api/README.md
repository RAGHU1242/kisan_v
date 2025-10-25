# AgriGo ML API

Machine Learning API for agricultural equipment recommendations.

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

## API Endpoints

### POST /predict
Get equipment recommendations based on farming parameters.

**Request:**
```json
{
  "cropType": "wheat",
  "farmStage": "land-preparation",
  "cropWeight": "1000 kg"
}
```

**Response:**
```json
{
  "success": true,
  "recommendedTypes": ["tractor", "cultivator"],
  "confidence": 0.85,
  "message": "Based on wheat at land-preparation stage, we recommend these equipment types",
  "metadata": {
    "cropType": "wheat",
    "farmStage": "land-preparation",
    "cropWeight": "1000 kg",
    "modelVersion": "1.0",
    "timestamp": "2024-01-01T12:00:00"
  }
}
```

### GET /health
Health check endpoint.

### GET /model-info
Get information about the ML model.

## Production Deployment

```bash
# Using gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Future Enhancements

- Integrate real ML models (scikit-learn, TensorFlow)
- Add model training pipeline
- Implement A/B testing for recommendations
- Add caching layer (Redis)
- Implement rate limiting
- Add authentication for API access
