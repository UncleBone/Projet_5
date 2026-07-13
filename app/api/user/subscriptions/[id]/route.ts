import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/controller/user.controller';
import { verifyToken } from '@/lib/jwt';

const controller = new UserController;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
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
    await controller.addSubscription(decoded.id,Number(id));
    
    return NextResponse.json({ message: "abonnement rajouté" }, {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
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
    await controller.removeSubscription(decoded.id,Number(id));
    
    return NextResponse.json(null, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}