import { NodeClient } from '../lib/NodeClient';
import { toHex } from '@vco/vco-testing';

/**
 * VCO Social Networking Layer - Integration Test
 * 
 * This test verifies:
 * 1. Node connection and ready state.
 * 2. Subscription to a global channel.
 * 3. Publication of a verifiable envelope.
 * 4. Receipt of own message (loopback).
 */
export async function runNetworkingIntegrationTest() {
  console.log("🚀 Starting Networking Integration Test...");
  
  const client = NodeClient.getInstance();
  const testChannel = `vco://test/integration-${Date.now()}`;
  let testSuccess = true;

  try {
    // 1. Connect
    console.log("Step 1: Connecting to swarm...");
    await client.connect();
    
    // 2. Wait for Ready
    const readyEvent = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => reject("Timeout waiting for node ready"), 10000);
      const cleanup = client.onEvent((e) => {
        if (e.type === 'ready') {
          clearTimeout(timeout);
          cleanup();
          resolve(e);
        }
      });
    });
    console.log(`✅ Node Ready. PeerID: ${readyEvent.peerId}`);

    // 3. Subscribe
    console.log(`Step 2: Subscribing to ${testChannel}...`);
    client.subscribe(testChannel);

    // 4. Publish & Listen
    const testPayload = btoa(JSON.stringify({ test: "integration-vco", timestamp: Date.now() }));
    
    console.log("Step 3: Publishing test envelope...");
    const received = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);
      const cleanup = client.onEvent((e) => {
        if (e.type === 'envelope' && e.channelId === testChannel) {
          if (e.envelope === testPayload) {
            clearTimeout(timeout);
            cleanup();
            resolve(true);
          }
        }
      });
      client.publish(testChannel, testPayload);
    });

    if (received) {
      console.log("✅ Loopback test passed (Message received via swarm)");
    } else {
      console.error("❌ Loopback test failed (Message not received)");
      testSuccess = false;
    }

    // 5. Cleanup
    client.unsubscribe(testChannel);
    console.log("Step 4: Cleanup successful.");

  } catch (err) {
    console.error("❌ Integration test failed with error:", err);
    testSuccess = false;
  }

  if (testSuccess) {
    console.log("🎉 ALL NETWORKING INTEGRATION TESTS PASSED");
  } else {
    console.log("💀 INTEGRATION TESTS FAILED");
    throw new Error("Networking Integration Test Failed");
  }
}
