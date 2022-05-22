export function getEnvironmentVariable(
  name: string,
  defaultValue = ''
): string {
  return process.env[name] ?? defaultValue
}
