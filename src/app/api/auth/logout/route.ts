import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Sesión cerrada' },
    { status: 200 }
  );
  
  // Eliminar la cookie de autenticación
  response.cookies.delete('admin_auth_token');
  
  return response;
}

