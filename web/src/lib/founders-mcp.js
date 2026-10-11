import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export const JUDGE_KEY = 'alexa-chan:founders:mcp-profile:v1';
export const STUDENT_JUDGE_KEY = 'alexa-chan:student:mcp-profile:v1';
export const REQUIRED_TOOLS = ['get_day_programme', 'explain_phrase', 'save_phrase', 'list_memories', 'review_phrase'];

// Separate from PERSONAL_KEY: no access to the user's calendar snapshot or notes.
export function createFoundersClient({ baseUrl, storage, fetcher = fetch, onTrace = () => {}, storageKey = JUDGE_KEY }) {
  let client, transport, generation = 0;
  const endpoint = new URL('/mcp', baseUrl);
  const traceFetch = async (url, options) => {
    let request;
    try { request = typeof options?.body === 'string' ? JSON.parse(options.body) : null; } catch { /* no request body */ }
    const name = request?.method === 'tools/call' ? `tools/call · ${request.params.name}` : request?.method;
    const started = performance.now();
    try {
      const response = await fetcher(url, options);
      if (name) {
        let payload;
        if (response.headers.get('content-type')?.includes('application/json')) payload = await response.clone().json();
        onTrace({ name, ok: response.ok && !payload?.error && !payload?.result?.isError,
          status: response.status, ms: Math.round(performance.now() - started), protocol: payload?.result?.protocolVersion });
      }
      return response;
    } catch (error) { if (name) onTrace({ name, ok: false, status: 'network', ms: Math.round(performance.now() - started) }); throw error; }
  };
  return {
    async connect() {
      const attempt = ++generation;
      await client?.close();
      client = undefined;
      let token = storage.getItem(storageKey);
      if (token && !/^[a-f0-9]{64}$/.test(token)) throw Error('The local judge profile key is invalid. Your personal journey is unchanged.');
      if (!token) {
        // Read/write storage before creating a profile, so blocked storage fails clearly.
        storage.setItem(`${JUDGE_KEY}:check`, '1'); storage.removeItem(`${JUDGE_KEY}:check`);
        const response = await fetcher(new URL('/mcp/profile', baseUrl), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw Error('Cannot create a judge profile. Start the MCP server and try again.');
        const profile = await response.json();
        if (!/^[a-f0-9]{64}$/.test(profile.token)) throw Error('Invalid judge profile response.');
        token = profile.token;
        storage.setItem(storageKey, token);
      }
      const next = new Client({ name: 'alexa-chan-web-judge', version: '1.0.0' });
      transport = new StreamableHTTPClientTransport(endpoint, {
        requestInit: { headers: { Authorization: `Bearer ${token}` } }, fetch: traceFetch
      });
      try {
        await next.connect(transport, { timeout: 10000 });
        const catalogue = await next.listTools({}, { timeout: 10000 });
        if (!REQUIRED_TOOLS.every(name => catalogue.tools.some(t => t.name === name))) throw Error('The server is missing a required journey tool.');
        if (attempt !== generation) throw Error('Connection cancelled.');
        client = next;
        return catalogue.tools.map(tool => tool.name);
      } catch (error) { await next.close(); throw error; }
    },
    async call(name, args = {}) {
      if (!client) throw Error('Connect to the MCP server first.');
      const response = await client.callTool({ name, arguments: args }, undefined, { timeout: 10000 });
      if (response.isError) throw Error(response.content?.find(item => item.type === 'text')?.text || 'The server rejected this action.');
      if (!response.structuredContent) throw Error('The MCP server returned no structured journey data.');
      return response.structuredContent;
    },
    async close() { generation++; const current = client; client = undefined; await current?.close(); }
  };
}
