import { loadConfig } from "./config.js";
import { RelayServer } from "./server.js";
import qrcode from "qrcode-terminal";

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
  
  const multiaddrs = server.multiaddrs.map((a) => a.toString());
  console.log("Multiaddrs:", multiaddrs.join(", "));

  // Find a primary non-localhost address to show as a QR code
  const primaryAddr = multiaddrs.find(a => !a.includes("127.0.0.1") && (a.includes("/tcp/") || a.includes("/udp/")));
  if (primaryAddr) {
    console.log("\nScan this QR code with the VCO app to dial this relay:");
    qrcode.generate(primaryAddr, { small: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
