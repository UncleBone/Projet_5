import { UserController } from '@/controller/user.controller';
import { authenticate } from '@/lib/authenticate';
import { withErrorHandling } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';

const controller = new UserController;

async function getHandler(req: Request) {
    const decoded = authenticate(req);
    if (!decoded) {
        return new Response(JSON.stringify({ message: 'Token invalide' }), { status: 401 });
    }

    const user = await controller.getUserInfo(decoded.id); 

    return new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

async function putHandler(req: Request) {
    const decoded = authenticate(req);
    if (!decoded) {
        return new Response(JSON.stringify({ message: 'Token invalide' }), { status: 401 });
    }

    const data = await req.json();
    const result = await controller.update(decoded.id,data);

    return NextResponse.json(result, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

export const GET = withErrorHandling(getHandler);
export const PUT = withErrorHandling(putHandler);