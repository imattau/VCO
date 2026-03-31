# Production Readiness Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove test-only imports from production bundle, gate mock networking behind an env var, and fix silent error swallowing.

**Architecture:** Three independent areas of change — encoding utilities extraction, mock networking guard, and error handling fixes. Each task is self-contained and can be committed independently.

**Tech Stack:** TypeScript, React, Vite (`import.meta.env`), `@tauri-apps/api`

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| **Create** | `src/lib/encoding.ts` | Production `toHex`/`fromHex` replacing `@vco/vco-testing` |
| **Modify** | `src/lib/KeyringService.ts` | Use `encoding.ts`; log keyring errors |
| **Modify** | `src/lib/FeedService.ts` | Use `encoding.ts` |
| **Modify** | `src/features/SocialContext.tsx` | Use `encoding.ts`; log DM decryption failures |
| **Modify** | `src/features/feed/PostCard.tsx` | Use `encoding.ts` |
| **Modify** | `src/features/feed/ThreadView.tsx` | Use `encoding.ts` |
| **Modify** | `src/features/notifications/NotificationView.tsx` | Use `encoding.ts` |
| **Modify** | `src/features/profile/ProfileView.tsx` | Use `encoding.ts` |
| **Modify** | `src/lib/NodeClient.ts` | Gate mock networking behind `VITE_MOCK_NETWORK` |
| **Modify** | `src/lib/ProfileService.ts` | Fix channel name to match constants format |

---

## Task 1: Create production encoding utilities

**Files:**
- Create: `packages/vco-social/src/lib/encoding.ts`

- [ ] **Step 1: Write the file**

```typescript
// packages/vco-social/src/lib/encoding.ts

/**
 * Converts a Uint8Array to a lowercase hex string.
 * Production replacement for toHex from @vco/vco-testing.
 */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts a hex string to a Uint8Array.
 */
export function fromHex(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array(0);
  return new Uint8Array(matches.map(b => parseInt(b, 16)));
}
```

- [ ] **Step 2: Commit**

```bash
cd packages/vco-social
git add src/lib/encoding.ts
git commit -m "feat: add production encoding utilities (toHex/fromHex)"
```

---

## Task 2: Replace @vco/vco-testing imports — KeyringService

**Files:**
- Modify: `packages/vco-social/src/lib/KeyringService.ts`

- [ ] **Step 1: Replace import and fix silent catch**

Replace line 8:
```typescript
import { toHex } from "@vco/vco-testing";
```
With:
```typescript
import { toHex } from "@/lib/encoding";
```

Replace lines 25-29 (`getStorageKey` catch block):
```typescript
    } catch (e) {}
```
With:
```typescript
    } catch (e) {
      console.error("KeyringService: Failed to get VCO profile from Tauri, using default", e);
    }
```

- [ ] **Step 2: Run typecheck**

```bash
cd /home/mattthomson/workspace/VCO
npm run typecheck --workspace=packages/vco-social
```
Expected: no errors in KeyringService.ts

- [ ] **Step 3: Commit**

```bash
cd packages/vco-social
git add src/lib/KeyringService.ts
git commit -m "fix: replace vco-testing import in KeyringService; log keyring errors"
```

---

## Task 3: Replace @vco/vco-testing imports — FeedService

**Files:**
- Modify: `packages/vco-social/src/lib/FeedService.ts`

- [ ] **Step 1: Read the current import line in FeedService.ts to confirm line number**

Read `packages/vco-social/src/lib/FeedService.ts` lines 1-15.

- [ ] **Step 2: Replace the import**

Replace:
```typescript
import { toHex } from "@vco/vco-testing";
```
With:
```typescript
import { toHex } from "@/lib/encoding";
```

- [ ] **Step 3: Run typecheck**

```bash
cd /home/mattthomson/workspace/VCO
npm run typecheck --workspace=packages/vco-social
```

- [ ] **Step 4: Commit**

```bash
git add packages/vco-social/src/lib/FeedService.ts
git commit -m "fix: replace vco-testing import in FeedService"
```

---

## Task 4: Replace @vco/vco-testing imports — SocialContext + fix DM decryption error

**Files:**
- Modify: `packages/vco-social/src/features/SocialContext.tsx`

- [ ] **Step 1: Replace static import at line 17**

Replace:
```typescript
import { mockCid, toHex } from '@vco/vco-testing';
```
With:
```typescript
import { toHex } from '@/lib/encoding';
```

- [ ] **Step 2: Replace dynamic import of toHex at line 251**

In `handleInboundEnvelope`, replace:
```typescript
      const { toHex } = await import('@vco/vco-testing');
```
With:
```typescript
      const { toHex } = await import('@/lib/encoding');
```

- [ ] **Step 3: Fix silent DM decryption catch at line 221**

Replace:
```typescript
          } catch(e) {}
```
With:
```typescript
          } catch(e) {
            console.warn("SocialContext: DM decryption failed — wrong key, tampered ciphertext, or protocol mismatch", e);
          }
```

- [ ] **Step 4: Run typecheck**

```bash
cd /home/mattthomson/workspace/VCO
npm run typecheck --workspace=packages/vco-social
```
Expected: no errors. If `mockCid` was used elsewhere in this file, search and remove any remaining references.

- [ ] **Step 5: Commit**

```bash
git add packages/vco-social/src/features/SocialContext.tsx
git commit -m "fix: replace vco-testing import in SocialContext; log DM decryption failures"
```

---

## Task 5: Replace @vco/vco-testing imports — UI components

**Files:**
- Modify: `packages/vco-social/src/features/feed/PostCard.tsx`
- Modify: `packages/vco-social/src/features/feed/ThreadView.tsx`
- Modify: `packages/vco-social/src/features/notifications/NotificationView.tsx`
- Modify: `packages/vco-social/src/features/profile/ProfileView.tsx`

- [ ] **Step 1: For each file, replace the import**

In each file, find:
```typescript
import { toHex } from '@vco/vco-testing';
// or
import { mockCid, toHex } from '@vco/vco-testing';
```
Replace with:
```typescript
import { toHex } from '@/lib/encoding';
```

Remove any `mockCid` usages — search each file for `mockCid(` and replace with a real CID or remove the expression.

- [ ] **Step 2: Run typecheck**

```bash
cd /home/mattthomson/workspace/VCO
npm run typecheck --workspace=packages/vco-social
```

- [ ] **Step 3: Verify no remaining vco-testing imports in src (excluding test files)**

```bash
grep -r "from '@vco/vco-testing'" packages/vco-social/src --include="*.ts" --include="*.tsx" \
  | grep -v "__tests__"
```
Expected: empty output.

- [ ] **Step 4: Commit**

```bash
git add packages/vco-social/src/features/feed/PostCard.tsx \
        packages/vco-social/src/features/feed/ThreadView.tsx \
        packages/vco-social/src/features/notifications/NotificationView.tsx \
        packages/vco-social/src/features/profile/ProfileView.tsx
git commit -m "fix: replace vco-testing imports in UI components"
```

---

## Task 6: Gate mock networking behind VITE_MOCK_NETWORK env var

**Files:**
- Modify: `packages/vco-social/src/lib/NodeClient.ts`

- [ ] **Step 1: Replace auto-mock logic in `connect()`**

Replace lines 42-47:
```typescript
  public async connect(): Promise<void> {
    if (!isTauri()) {
      console.warn('NodeClient: Running in browser mode. Using mock networking.');
      this.startMockNode();
      return;
    }
```
With:
```typescript
  public async connect(): Promise<void> {
    if (!isTauri()) {
      if (import.meta.env.VITE_MOCK_NETWORK === 'true') {
        console.warn('NodeClient: VITE_MOCK_NETWORK=true — using mock networking (dev only).');
        this.startMockNode();
      } else {
        console.error('NodeClient: Not running in Tauri and VITE_MOCK_NETWORK is not set. Node unavailable.');
        this.handleEvent({ type: 'error', message: 'Node requires Tauri runtime. Set VITE_MOCK_NETWORK=true for browser development.' });
      }
      return;
    }
```

- [ ] **Step 2: Replace fallback mock in catch block (lines 59-62)**

Replace:
```typescript
    } catch (error) {
      console.error('NodeClient: Failed to connect to native node.', error);
      this.startMockNode();
    }
```
With:
```typescript
    } catch (error) {
      console.error('NodeClient: Failed to connect to native node.', error);
      this.handleEvent({ type: 'error', message: `Failed to connect to native node: ${error}` });
    }
```

- [ ] **Step 3: Run typecheck**

```bash
cd /home/mattthomson/workspace/VCO
npm run typecheck --workspace=packages/vco-social
```

- [ ] **Step 4: Commit**

```bash
git add packages/vco-social/src/lib/NodeClient.ts
git commit -m "fix: gate mock networking behind VITE_MOCK_NETWORK env var"
```

---

## Task 7: Fix ProfileService channel name inconsistency

**Files:**
- Modify: `packages/vco-social/src/lib/ProfileService.ts`

- [ ] **Step 1: Read ProfileService.ts to see the full publish call**

Read `packages/vco-social/src/lib/ProfileService.ts`.

- [ ] **Step 2: Fix channel ID format**

Find the publish call using `'vco/profiles/v1'` and replace with the proper channel URI format matching constants.ts:
```typescript
// Replace:
channelId: 'vco/profiles/v1'
// With:
channelId: 'vco://channels/profiles/v1'
```

- [ ] **Step 3: Run typecheck**

```bash
cd /home/mattthomson/workspace/VCO
npm run typecheck --workspace=packages/vco-social
```

- [ ] **Step 4: Commit**

```bash
git add packages/vco-social/src/lib/ProfileService.ts
git commit -m "fix: align ProfileService channel ID format with constants"
```

---

## Final Verification

- [ ] **Full typecheck**

```bash
cd /home/mattthomson/workspace/VCO
npm run typecheck
```
Expected: zero errors.

- [ ] **No vco-testing in production source**

```bash
grep -r "from '@vco/vco-testing'" packages/vco-social/src --include="*.ts" --include="*.tsx" \
  | grep -v "__tests__"
```
Expected: empty.

- [ ] **No auto-mock in NodeClient**

```bash
grep -n "startMockNode" packages/vco-social/src/lib/NodeClient.ts
```
Expected: only the `startMockNode()` definition and one call inside the `VITE_MOCK_NETWORK` guard.
