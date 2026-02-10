import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const { url, request, redirect } = context;
  const pathname = url.pathname;

  // Si ya está en una ruta específica de idioma, continuar
  if (pathname.startsWith('/en') || pathname === '/en') {
    return next();
  }

  // Si está en la raíz y no tiene cookie de idioma, detectar del navegador
  if (pathname === '/' || pathname === '') {
    const languageCookie = request.headers.get('cookie')?.includes('preferred-language');
    
    if (!languageCookie) {
      // Obtener el idioma del navegador
      const acceptLanguage = request.headers.get('accept-language');
      
      if (acceptLanguage) {
        // Parsear el header Accept-Language
        const languages = acceptLanguage
          .split(',')
          .map(lang => {
            const [code, q = 'q=1.0'] = lang.trim().split(';');
            const quality = parseFloat(q.replace('q=', ''));
            return { code: code.split('-')[0].toLowerCase(), quality };
          })
          .sort((a, b) => b.quality - a.quality);

        // Si el idioma preferido es inglés, redirigir a /en
        const preferredLanguage = languages[0]?.code;
        if (preferredLanguage === 'en') {
          // Crear la respuesta de redirección
          const response = redirect('/en', 302);
          // Añadir cookie para recordar la preferencia
          response.headers.set('Set-Cookie', 'preferred-language=en; Path=/; Max-Age=31536000; SameSite=Lax');
          return response;
        }
      }
    }
  }

  return next();
});
