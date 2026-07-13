import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function withErrorHandling(handler: (req: Request) => Promise<Response>) {
    return async function(req: Request) {
        try {
            return await handler(req)
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

            return NextResponse.json({ message }, {
                status,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}