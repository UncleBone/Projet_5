import { UserController } from '@/controller/user.controller';
import { verifyToken } from '@/lib/jwt';

const controller = new UserController;

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

        const subs = await controller.getUserSubscriptions(decoded.id); 

        return new Response(JSON.stringify(subs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ message: 'Erreur serveur' }), { status: 500 });
    }
}