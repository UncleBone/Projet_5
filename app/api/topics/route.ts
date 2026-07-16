import { TopicController } from '@/controller/topic.controller';
import { authenticate } from '@/lib/authenticate';
import { withErrorHandling } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/jwt';

const controller = new TopicController;

async function getHandler(req: Request) {
    const decoded = authenticate(req);
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