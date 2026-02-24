import { Negentropy, NegentropyStorage, uint8ArrayToHex } from "@nostr-dev-kit/sync";
import type { ReconciliationItem } from "./types.js";

const NEGENTROPY_ID_SIZE_BYTES = 32;

export interface NegentropyReconciliation {
  need: Set<string>;
  have: Set<string>;
  rounds: number;
}

function validateItem(item: ReconciliationItem, fieldName: string): void {
  if (!Number.isInteger(item.timestamp) || item.timestamp < 0) {
    throw new Error(`${fieldName}.timestamp must be a non-negative integer.`);
  }

  if (item.id.length !== NEGENTROPY_ID_SIZE_BYTES) {
    throw new Error(
      `${fieldName}.id must be ${NEGENTROPY_ID_SIZE_BYTES} bytes.`,
    );
  }
}

function toStorage(items: readonly ReconciliationItem[], fieldName: string): NegentropyStorage {
  const storage = new NegentropyStorage();

  for (const [index, item] of items.entries()) {
    validateItem(item, `${fieldName}[${index}]`);
    storage.insert(item.timestamp, item.id);
  }

  storage.seal();
  return storage;
}

function collectSet(target: Set<string>, ids: Uint8Array[]): void {
  for (const id of ids) {
    target.add(uint8ArrayToHex(id));
  }
}

export async function reconcileWithNegentropy(
  localItems: readonly ReconciliationItem[],
  remoteItems: readonly ReconciliationItem[],
  frameSizeLimit: number,
): Promise<NegentropyReconciliation> {
  const local = new Negentropy(toStorage(localItems, "localItems"), frameSizeLimit);
  const remote = new Negentropy(toStorage(remoteItems, "remoteItems"), frameSizeLimit);
  const need = new Set<string>();
  const have = new Set<string>();

  let message: Uint8Array | undefined = await local.initiate();
  let rounds = 0;
  let localTurn = false;

  while (message) {
    rounds += 1;

    if (localTurn) {
      const response = await local.reconcile(message);
      collectSet(need, response.need);
      collectSet(have, response.have);
      message = response.nextMessage;
    } else {
      const response = await remote.reconcile(message);
      message = response.nextMessage;
    }

    localTurn = !localTurn;
  }

  return { need, have, rounds };
}
