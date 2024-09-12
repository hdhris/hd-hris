import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const jobTitles = await prisma.ref_job_classes.findMany({
      select: { id: true, name: true },
    });
    return NextResponse.json(jobTitles);
  } catch (error) {
    console.error('Error fetching job titles:', error);
    return NextResponse.json({ error: 'Failed to fetch job titles' }, { status: 500 });
  }
}
