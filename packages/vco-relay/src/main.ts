import { loadConfig } from "./config.js";
import { RelayServer } from "./server.js";

async function main() {
  const configPath = process.env.VCO_CONFIG_PATH;
  const config = loadConfig({ configPath, env: process.env as Record<string, string | undefined> });

  const server = new RelayServer(config);

  process.on("SIGINT", async () => {
    await server.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await server.stop();
    process.exit(0);
  });

  await server.start();

  console.log("VCO Relay started");
  console.log("PeerID:", server.peerId?.toString());
  console.log("Multiaddrs:", server.multiaddrs.map((a) => a.toString()).join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
