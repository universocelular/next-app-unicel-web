import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Verificar credenciales (estas están en variables de entorno del servidor)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@universocelular.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (email === adminEmail && password === adminPassword) {
      // Crear un token simple (en producción usarías JWT)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      
      // Crear respuesta exitosa
      const response = NextResponse.json(
        { success: true, message: 'Autenticación exitosa' },
        { status: 200 }
      );
      
      // Configurar cookie con el token
      response.cookies.set('admin_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
      });
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, message: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

