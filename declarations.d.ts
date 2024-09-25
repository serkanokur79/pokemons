declare module '*.json' {
  const value: Record<string, unknown>; // Changed from any to Record<string, unknown>
  export default value;
}
