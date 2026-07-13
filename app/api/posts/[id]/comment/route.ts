import { PostController } from '@/controller/post.controller'
import { verifyToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

const controller = new PostController;

export async function POST(req: Request) {
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

        const data = await req.json();
        await controller.addComment(decoded.id,data);

        return NextResponse.json(null, {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        if (error instanceof ZodError) {
            const errors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));
            return NextResponse.json(errors[0], {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const status = error.status || 500;
        const message = error.message || 'Erreur serveur';

        return new Response(JSON.stringify({ message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}