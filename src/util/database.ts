export function base(path: string, data: Record<string, any>): Record<string, any> {
  const e = Object.entries(data).map(([k, v]) => [k ? (k.startsWith('@') ? `${path}${k}` : `${path}/${k}`) : path, v]);
  return Object.fromEntries(e);
}
