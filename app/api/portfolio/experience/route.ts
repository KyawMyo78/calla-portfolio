import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { callRevalidate } from '@/lib/revalidate';

export async function GET() {
  try {
    const experienceRef = adminDb.collection('portfolio').doc('data');
    const doc = await experienceRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const data = doc.data();
    const experiences = data?.experience || [];

    // Sort by order and start date (most recent first)
    const sortedExperiences = experiences.sort((a: any, b: any) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return NextResponse.json({
      success: true,
      data: sortedExperiences
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const experienceData = await request.json();

    // Validation
    if (!experienceData.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Job title is required' },
        { status: 400 }
      );
    }

    if (!experienceData.company?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    if (!experienceData.startDate) {
      return NextResponse.json(
        { success: false, error: 'Start date is required' },
        { status: 400 }
      );
    }

    // Generate ID for new experience
    const experienceId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare experience object
    const newExperience: any = {
      id: experienceId,
      title: experienceData.title.trim(),
      company: experienceData.company.trim(),
      location: experienceData.location?.trim() || '',
      startDate: experienceData.startDate,
      current: Boolean(experienceData.current),
      description: experienceData.description?.trim() || '',
      responsibilities: Array.isArray(experienceData.responsibilities) 
        ? experienceData.responsibilities.filter((item: string) => item.trim()) 
        : [],
      achievements: Array.isArray(experienceData.achievements) 
        ? experienceData.achievements.filter((item: string) => item.trim()) 
        : [],
      technologies: Array.isArray(experienceData.technologies) 
        ? experienceData.technologies.filter((item: string) => item.trim()) 
        : [],
      order: Number(experienceData.order) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add endDate only if not current job and endDate exists
    if (!experienceData.current && experienceData.endDate) {
      newExperience.endDate = experienceData.endDate;
    }

    // Add companyUrl only if it exists
    if (experienceData.companyUrl?.trim()) {
      newExperience.companyUrl = experienceData.companyUrl.trim();
    }

    // Get current portfolio data
    const portfolioRef = adminDb.collection('portfolio').doc('data');
    const doc = await portfolioRef.get();
    
    let currentData = {};
    if (doc.exists) {
      currentData = doc.data() || {};
    }

    // Add new experience to the array
    const currentExperiences = (currentData as any).experience || [];
    const updatedExperiences = [...currentExperiences, newExperience];

    // Update the document
    await portfolioRef.set({
      ...currentData,
      experience: updatedExperiences,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // revalidate home and experience list
    try { callRevalidate(['/','/experience']); } catch (e) { console.warn(e); }
    return NextResponse.json({
      success: true,
      data: newExperience
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create experience' },
      { status: 500 }
    );
  }
}
