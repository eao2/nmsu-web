// functions/_middleware.js
const BACKEND_URL = 'https://nmsu.ne-to.com';

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/api/auth')) {
    console.log(`✅ Local auth: ${url.pathname} (not proxying)`);
    return context.next();
  }
  
  if (url.pathname.startsWith('/api/')) {
    console.log(`🔄 Proxying: ${url.pathname} → ${BACKEND_URL}${url.pathname}`);
    
    const backendUrl = new URL(url.pathname + url.search, BACKEND_URL);
    
    const proxyRequest = new Request(backendUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    });
    
    const response = await fetch(proxyRequest);
    
    const newResponse = new Response(response.body, response);
    
    const setCookie = newResponse.headers.get('set-cookie');
    if (setCookie) {
      const modifiedCookie = setCookie
        .replace(/Domain=[^;]+;?/gi, '')
        .replace(/SameSite=None/gi, 'SameSite=Lax');
      
      newResponse.headers.set('set-cookie', modifiedCookie);
    }
    
    newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return newResponse;
  }
  
  return context.next();
}