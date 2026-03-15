export type AppSearchParams = Promise<Record<string, string | string[] | undefined>>;

export function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];

  return Array.isArray(value) ? value[0] : value;
}
