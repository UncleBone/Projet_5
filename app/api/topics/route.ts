import { TopicController } from '@/controller/topic.controller';
import { verifyToken } from '@/lib/jwt';

const controller = new TopicController;

export async function GET(req: Request) {
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

        const topics = await controller.getAll(); 

        return new Response(JSON.stringify(topics), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ message: 'Erreur serveur' }), { status: 500 });
    }
}