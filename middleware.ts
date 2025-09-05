import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui_2024';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas que NÃO precisam de autenticação
  const publicRoutes = [
    '/login',
    '/api/auth',
    '/api/usuarios',
    '/api/filas',
    '/api/usuarios/importar',
    '/api/usuarios/disponiveis',
    '/api/usuarios/auth',
    '/api/webhook-logs',
    '/api/configuracoes'
  ];

  // Se for uma rota pública, permitir acesso
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Para outras rotas de API, verificar autenticação
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Acesso negado' },
          { status: 403 }
        );
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
  }

  // Para rotas do frontend, deixar o AuthGuard cuidar da autenticação
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
