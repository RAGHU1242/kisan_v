import { NextRequest, NextResponse } from 'next/server';

// Simple ML recommendation logic (mock implementation)
// In production, this would call a Python Flask ML API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cropType, farmStage, cropWeight } = body;

    // Recommendation mapping based on farm stage and crop type
    const recommendations: { [key: string]: string[] } = {
      'land-preparation': ['tractor', 'cultivator'],
      'sowing': ['planter', 'tractor'],
      'maintenance': ['sprayer', 'tractor'],
      'harvesting': ['harvester', 'tractor'],
      'post-harvest': ['tractor', 'sprayer'],
    };

    // Get recommended equipment types based on farm stage
    let recommendedTypes = recommendations[farmStage] || ['tractor', 'harvester', 'planter', 'sprayer'];

    // Adjust based on crop type
    if (cropType === 'rice' || cropType === 'wheat') {
      if (farmStage === 'harvesting') {
        recommendedTypes = ['harvester', 'tractor'];
      }
    }

    if (cropType === 'corn' || cropType === 'cotton') {
      if (farmStage === 'sowing') {
        recommendedTypes = ['planter', 'tractor'];
      }
    }

    // Return ML predictions
    return NextResponse.json({
      success: true,
      recommendedTypes,
      confidence: 0.85,
      message: `Based on ${cropType} at ${farmStage} stage, we recommend these equipment types`,
      metadata: {
        cropType,
        farmStage,
        cropWeight,
        modelVersion: '1.0',
      }
    }, { status: 200 });

  } catch (error) {
    console.error('ML Prediction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        recommendedTypes: ['tractor', 'harvester', 'planter', 'sprayer'], // Fallback
      },
      { status: 500 }
    );
  }
}
