import { AuthController } from "@/controller/auth.controller";
import { withErrorHandling } from "@/lib/errorHandler";
import { NextResponse } from "next/server";

const controller = new AuthController;

async function postHandler(req: Request) {
    const data = await req.json();
    const result = await controller.login(data);
    return NextResponse.json(result, { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export const POST = withErrorHandling(postHandler);