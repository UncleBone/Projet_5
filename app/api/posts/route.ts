import { PostController } from '@/controller/post.controller'
import { authenticate } from '@/lib/authenticate';
import { withErrorHandling } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';

const controller = new PostController;

async function getHandler(req: Request) {
    const decoded = authenticate(req);
    if(!decoded) return NextResponse.json({ message: 'Authentification requise' }, { status: 401 });

    const posts = await controller.getAll(decoded); 

    return NextResponse.json(posts, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
export const GET = withErrorHandling(getHandler);

async function postHandler(req: Request) {
    const decoded = authenticate(req);
    if(!decoded) return NextResponse.json({ message: 'Authentification requise' }, { status: 401 });

    const data = await req.json();
    const result = await controller.create(decoded.id,data);

    return NextResponse.json(null, {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
}
export const POST = withErrorHandling(postHandler);