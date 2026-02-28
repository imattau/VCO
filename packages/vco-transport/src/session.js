import { TransportObfuscationLayer } from "./tol.js";
export const DEFAULT_IDLE_TIMEOUT_SECONDS = 300;
function assertIdleTimeoutSeconds(idleTimeoutSeconds) {
    if (!Number.isInteger(idleTimeoutSeconds) || idleTimeoutSeconds <= 0) {
        throw new Error("idleTimeoutSeconds must be a positive integer.");
    }
}
export class TransportSession {
    tol;
    idleTimeoutMs;
    now;
    lastActivityAtMs;
    constructor(options = {}) {
        const idleTimeoutSeconds = options.idleTimeoutSeconds ?? DEFAULT_IDLE_TIMEOUT_SECONDS;
        assertIdleTimeoutSeconds(idleTimeoutSeconds);
        this.now = options.now ?? (() => Date.now());
        this.tol = new TransportObfuscationLayer(options);
        this.idleTimeoutMs = idleTimeoutSeconds * 1_000;
        this.lastActivityAtMs = this.now();
    }
    touch() {
        this.lastActivityAtMs = this.now();
    }
    isIdle() {
        return this.now() - this.lastActivityAtMs >= this.idleTimeoutMs;
    }
    encapsulatePayload(payload) {
        this.assertActive();
        const packetSet = this.tol.encapsulatePayload(payload);
        this.touch();
        return packetSet;
    }
    decapsulatePayload(packetSet) {
        this.assertActive();
        const payload = this.tol.decapsulatePayload(packetSet);
        this.touch();
        return payload;
    }
    snapshot() {
        return {
            idleTimeoutSeconds: this.idleTimeoutMs / 1_000,
            lastActivityAtMs: this.lastActivityAtMs,
        };
    }
    assertActive() {
        if (this.isIdle()) {
            throw new Error("Transport session expired due to idle timeout.");
        }
    }
}
//# sourceMappingURL=session.js.map