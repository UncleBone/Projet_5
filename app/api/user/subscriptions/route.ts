import { UserController } from '@/controller/user.controller';
import { authenticate } from '@/lib/authenticate';
import { withErrorHandling } from '@/lib/errorHandler';

const controller = new UserController;

async function getHandler(req: Request) {
    const decoded = authenticate(req);
    if (!decoded) {
        return new Response(JSON.stringify({ message: 'Token invalide' }), { status: 401 });
    }

    const subs = await controller.getUserSubscriptions(decoded.id); 

    return new Response(JSON.stringify(subs), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
export const GET = withErrorHandling(getHandler);