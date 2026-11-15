# Full-stack error log verification (Lab 4, Sprint 3)

Environment: Express 5 API on port 3001 (`API_DELAY_MS=800`), Vite dev server on 5173.

## A. Invalid POST payload (400)
Action: pressed Send with empty Author and Message.

UI message: `<paste the red text shown next to the Send button>`

Server log:
```
<paste the "... POST /api/messages/nasa -> 400" line from the server terminal>
```

## B. Unknown forum (404)
Command: `curl.exe -i http://localhost:3001/api/messages/unknown`

Response:
```
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json;charset=utf-8
Content-Length: 34
ETag: W/"22-mcN9aFN5zJAIjNBpQbL6l30RDCY"
Date: Sun, 15 Nov 2026 18:53:43GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Unknown forum: unknown"}
```

Server log:
```
400
2026-11-15T18:53:43.595Z GET /api/messages/unknown -> 404
```

## C. Server unreachable
Action: stopped the Express server, then switched channel.

UI: `Cannot reach the forum server`, with a Retry button.
Browser console: ` ERR_CONNECTION_REFUSED`.
After restarting the server, Retry loaded the messages again.

## D. In-flight requests under Slow 3G
Rapid switching NASA, Esports Tribunal, notNasa showed `(canceled)` for every superseded GET; only the last request completed with 200.