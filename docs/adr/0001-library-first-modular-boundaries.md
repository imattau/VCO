# ADR 0001: Library-First and Modular Boundaries

## Status
Accepted

## Context
VCO implementations touch high-risk domains (crypto, transport, binary formats, synchronization).

## Decision
- Prefer standard libraries and mature ecosystem packages before custom code.
- Keep package boundaries strict: crypto, core, sync, and transport are separate modules.
- Custom protocol logic is allowed only where domain-specific behavior does not exist in maintained libraries.

## Consequences
- Lower maintenance and security risk.
- Easier replacement of external libraries through adapter interfaces.
- More files/modules, but reduced coupling.
