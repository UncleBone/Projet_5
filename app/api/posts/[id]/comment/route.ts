import { PostController } from '@/controller/post.controller'
import { authenticate } from '@/lib/authenticate';
import { withErrorHandling } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';

const controller = new PostController;

async function postHandler(req: Request) {
    const decoded = authenticate(req);
    if(!decoded) return NextResponse.json({ message: 'Token invalide' }, { status: 401 });

    const data = await req.json();
    await controller.addComment(decoded.id,data);

    return NextResponse.json(null, {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
}
export const POST = withErrorHandling(postHandler);