// Unit tests of the real sync path run with cloud sync enabled; the app build defaults to no-sync.
const env = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process.env;
env.VITE_DUKI_CLOUD_SYNC ??= "on";
