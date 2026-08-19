export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // Dynamic import to avoid bundling issues at cold start
  const { default: server } = await import('../dist/server/assets/server-CGzWFl9C.js' as any);
  return server.fetch(request, {}, {});
}
