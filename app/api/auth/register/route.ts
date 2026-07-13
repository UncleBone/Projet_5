import { AuthController } from "@/controller/auth.controller";
import { withErrorHandling } from "@/lib/errorHandler";
import { NextResponse } from "next/server";

const controller = new AuthController;

async function postHandler(req: Request) {
    const data = await req.json();
    const result = await controller.register(data);
    return NextResponse.json(result, { status: 201, headers: { 'Content-Type': 'application/json' } });
}

export const POST = withErrorHandling(postHandler);