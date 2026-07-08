import { AuthController } from "@/controller/auth.controller";
import { ZodError } from "zod";

const controller = new AuthController;

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const result = await controller.register(data);
        return new Response(JSON.stringify(result), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        if (error instanceof ZodError) {
            const errors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));
            return new Response(JSON.stringify(errors[0]), {
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