import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // For now, return a placeholder. In production, use Cloudinary
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Save to user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { banner: dataUrl },
    });

    return NextResponse.json({
      message: 'Banner uploaded successfully',
      url: dataUrl,
    });
  } catch (error) {
    console.error('Banner upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading banner' },
      { status: 500 }
    );
  }
}
