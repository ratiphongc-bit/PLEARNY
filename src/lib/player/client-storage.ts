export function playerResultStorageKey(openId: string): string {
  return `plearny-last-result:${encodeURIComponent(openId)}`;
}
