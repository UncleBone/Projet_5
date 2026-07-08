import { AuthController } from "@/controller/auth.controller";

const controller = new AuthController;

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const result = await controller.login(data);
        return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        const status = error.status || 500;
        const message = error.message || 'Erreur serveur';

        return new Response(JSON.stringify({ message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}