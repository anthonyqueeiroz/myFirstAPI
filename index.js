const http = require('http');
const { URL } = require('url');

const routes = require('./routes');
const bodyParser = require('./helpers/bodyParser')

const server = http.createServer((request, response) => {

  const parsedUrl = new URL(`http://localhost:8000${request.url}`);
  // const parsedUrl = url.parse(request.url, true);

  let { pathname } = parsedUrl;

  let id = null;

  const splitEndPoint = pathname.split('/').filter(Boolean);

  response.send = (statusCode, body) => {
    response.writeHead(statusCode, {'Content-type': 'application/json'});
    response.end(JSON.stringify(body));
  }

  if (splitEndPoint.length > 1) {
    pathname = `/${splitEndPoint[0]}/:id`
    id = splitEndPoint[1];
  }

  const route = routes.find((routeOb) => (
    routeOb.endpoint === pathname && routeOb.method === request.method
  ));

  if (route) {
    request.query = Object.fromEntries(parsedUrl.searchParams);
    request.params = { id };

    if (['PUT', 'POST'].includes(request.method)) {
      bodyParser(request, () => route.handler(request, response));
    } else {
      route.handler(request, response);
    }
  }
  else {
    response.send(400, `Error 400: Cannot find ${request.method} ${request.url}`);
  }
  
  console.log(`Request method: ${request.method} | Endpoint: ${pathname}`);
});

server.listen(8000, () => {console.log('Servidor rodando certinho em http://localhost:8000')});

