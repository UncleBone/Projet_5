import { TopicController } from '@/controller/topic.controller';
import { withErrorHandling } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/jwt';

const controller = new TopicController;

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

    const topics = await controller.getAll(); 

    return new Response(JSON.stringify(topics), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

export const GET = withErrorHandling(getHandler);