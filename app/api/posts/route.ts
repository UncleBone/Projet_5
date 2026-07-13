import { PostController } from '@/controller/post.controller'
import { withErrorHandling } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

const controller = new PostController;

async function getHandler(req: Request) {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ message: 'Token manquant' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return new Response(JSON.stringify({ message: 'Token invalide' }), { status: 401 });
    }

    const posts = await controller.getAll(decoded); 

    return new Response(JSON.stringify(posts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
export const GET = withErrorHandling(getHandler);

async function postHandler(req: Request) {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ message: 'Token manquant' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return new Response(JSON.stringify({ message: 'Token invalide' }), { status: 401 });
    }

    const data = await req.json();
    const result = await controller.create(decoded.id,data);

    return NextResponse.json(null, {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
}
export const POST = withErrorHandling(postHandler);