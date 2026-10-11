const { createMcpApp } = require('./lib/mcp-app');
const port = Number(process.env.MCP_PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid MCP_PORT');
createMcpApp({ origins: [`http://127.0.0.1:${port}`, `http://localhost:${port}`, 'http://127.0.0.1:5173', 'http://localhost:5173'] })
  .then(app => app.listen(port, '127.0.0.1', () => console.log(`Alexa-chan university journey: http://127.0.0.1:${port}/student-mcp`)))
  .catch(() => { console.error('Cannot open the MCP profile store. Check local data permissions and JSON validity; no data was reset.'); process.exitCode = 1; });
