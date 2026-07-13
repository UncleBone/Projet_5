import { NextRequest, NextResponse } from 'next/server';
import { PostController } from '@/controller/post.controller';
import { verifyToken } from '@/lib/jwt';

const controller = new PostController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ message: 'Token manquant' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return new Response(JSON.stringify({ message: 'Token invalide' }), { status: 401 });
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