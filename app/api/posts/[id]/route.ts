import { NextRequest, NextResponse } from 'next/server';
import { PostController } from '@/controller/post.controller';
import { authenticate } from '@/lib/authenticate';

const controller = new PostController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const decoded = authenticate(req);
    if (!decoded) {
        return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }
    const post = await controller.getById(Number(id));
    if (!post) {
      return NextResponse.json({ message: 'Post non trouvé' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}