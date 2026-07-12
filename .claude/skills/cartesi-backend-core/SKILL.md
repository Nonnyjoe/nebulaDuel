---
name: cartesi-backend-core
version: 0.1.0
description: >-
  Language-agnostic specification for Cartesi Rollups v2 backend application
  logic. Defines deterministic state transitions, payload contracts, finish-loop
  correctness, and verifiable output emission under replay and dispute conditions.
---

# Cartesi Rollups Backend Core (Specification)

## 1. Objective

Define a **deterministic, reproducible, and verifiable backend execution model** for Cartesi Rollups v2 applications, independent of programming language or runtime.

This specification governs how backend applications:

- Process ordered inputs (`advance_state`);
- Serve read-only queries (`inspect_state`);
- Maintain and evolve application state;
- Emit verifiable outputs (notices, reports, vouchers);
- Report execution status via the `/finish` loop.

---

## 2. Scope

### In scope

- Deterministic state transition model;
- `advance_state` and `inspect_state` semantics;
- `/finish` loop correctness and status propagation;
- Payload schema contracts and encoding rules;
- Output emission rules and constraints;
- Error and rejection semantics;
- Replay and verifiability guarantees.

### Out of scope

- Deployment and infrastructure;
- Frontend/UI behavior;
- Language-specific implementation details.

---

## 3. Authoritative references

- Rollups 2.0 overview:  
  https://docs.cartesi.io/cartesi-rollups/2.0/

- JSON-RPC API:  
  https://docs.cartesi.io/cartesi-rollups/2.0/api-reference/jsonrpc/overview/

- Inputs and inspect:  
  https://docs.cartesi.io/cartesi-rollups/2.0/development/send-inputs-and-assets/

- Backend template sources (Cartesi CLI templates):  
  https://github.com/cartesi/application-templates/tree/prerelease/sdk-12

- Backend APIs:  
  Notices / Reports / Vouchers / Exception / Finish

---

## 4. Core execution model

The backend MUST behave as a **deterministic state machine**:

```
S(n+1) = f(S(n), input_n)
```

Where:

- `S(n)` is the complete application state after processing input `n`;
- `input_n` is the nth input in a strictly ordered sequence;
- `f` is a deterministic transition function.

### Requirements

- State transitions MUST be:
  - deterministic
  - reproducible
  - side-effect free outside defined outputs
- Given identical input sequences, the backend MUST produce:
  - identical state
  - identical outputs

---

## 5. Determinism constraints

The backend MUST NOT depend on nondeterministic sources.

### Forbidden sources

- System time (`now`, timestamps)
- Unseeded randomness
- External network or API calls
- Environment-dependent behavior
- Non-deterministic floating-point inconsistencies

### Allowed patterns

- Seeded pseudo-randomness derived from input/state
- Fully deterministic libraries and algorithms

---

## 6. State model and persistence

### Requirements

- State MUST be:
  - explicitly defined
  - serializable
  - replayable from genesis
- No hidden or implicit state:
  - no reliance on global mutable variables outside state definition
  - no reliance on process memory that is not reconstructible

### Initial state

The application MUST define a clear **initial state (S₀)**.

### Replay guarantee

Reprocessing all inputs from genesis MUST reconstruct the exact current state.

---

## 7. Input processing model

### Ordering

- Inputs are strictly ordered.
- Processing MUST be sequential and non-parallel.

### Idempotency and replay

- Handlers MUST produce identical results under replay.
- Re-execution of the same input MUST NOT introduce divergence.

### Constraints

- No side-effects outside:
  - state mutation
  - defined outputs (notices, vouchers, reports)

---

## 8. Handler semantics

### `advance_state`

- Write path.
- MAY:
  - mutate state
  - emit notices, reports, vouchers
- MUST:
  - validate payload
  - enforce transition rules
  - return correct status (`accept` or `reject`)

### `inspect_state`

- Read-only path.
- MUST NOT:
  - mutate state
- MUST:
  - return deterministic responses based on current state
  - use consistent response schemas

---

## 9. Finish loop correctness

The `/finish` loop defines execution truth.

### Requirements

- `finish.status` MUST reflect actual handler result.
- MUST NOT:
  - hardcode acceptance
  - ignore handler failures

### Status rules

- `accept`: valid state transition applied
- `reject`: invalid input or transition

### Observability

- Reject reasons SHOULD be:
  - logged
  - optionally emitted via reports

---

## 10. Payload contract

### Requirements

- All advance inputs MUST follow a **versioned schema**.
- Payloads MUST:
  - include a version identifier
  - use consistent encoding (e.g., JSON, ABI)

### Validation

- Validate at boundary (before state transition)
- Invalid payloads MUST result in rejection

---

## 11. Schema evolution

### Rules

- Prefer backward-compatible changes:
  - additive fields
- Avoid breaking changes
- Support multiple versions if required

---

## 12. Output semantics

### Notices

- Represent verifiable, consensus-relevant outputs
- SHOULD be used for:
  - events
  - state-derived signals

### Reports

- Diagnostic or informational outputs
- NOT consensus-critical

### Vouchers

- Represent external execution intent

### Voucher constraints

- MUST be deterministic
- MUST be derived solely from:
  - input
  - current state
- MUST NOT depend on:
  - external conditions

---

## 13. Error and rejection model

### Reject conditions

- Invalid payload schema
- Invalid state transition
- Unauthorized or malformed input

### Accept with report

- Non-critical issues
- Diagnostics

### Requirements

- Error handling MUST be explicit
- Define structured error formats (recommended)

---

## 14. Computation boundaries

### Constraints

- Each input MUST have bounded computation
- MUST avoid:
  - unbounded loops
  - unbounded memory growth

### For heavy workloads

- Split across multiple inputs
- Persist intermediate state

---

## 15. Inspect consistency model

- Inspect responses MUST reflect:
  - last committed state
- MUST NOT expose:
  - partial or intermediate state

---

## 16. Asset-aware logic (if applicable)

If handling assets:

- Validate:
  - asset type
  - amount
- Maintain consistent accounting
- Ensure state reflects all deposits accurately

---

## 17. Security model

- All inputs are untrusted
- MUST validate:
  - payload size
  - encoding correctness
- MUST guard against:
  - malformed data
  - overflow or resource exhaustion

---

## 18. Architecture requirements

Backend implementations SHOULD separate:

1. Transport layer (`/finish`)
2. Dispatcher
3. Domain logic (pure functions)
4. State representation
5. Output emitters
6. Inspect handlers

### Recommendation

Domain logic SHOULD be pure and independently testable.

---

## 19. Observability

- Reports SHOULD be used for structured diagnostics
- Logs SHOULD include:
  - input index
  - handler outcome
- Avoid excessive inspect-based debugging in production

---

## 20. Testing requirements

At minimum:

- Deterministic replay:
  - identical inputs → identical outputs
- Valid state transitions
- Invalid payload rejection
- Inspect correctness
- Finish loop correctness
- Long sequence simulation
- Voucher validation

---

## 21. Common pitfalls

- Mutating state in inspect handlers
- Hidden nondeterminism (time, randomness)
- Hardcoding `accept` in `/finish`
- Inconsistent encoding formats
- Unbounded computation per input

---

## 22. Completion contract

Deliverables MUST include:

- State model definition
- Transition function description
- Versioned payload schemas
- Inspect route catalog
- Error/reject semantics
- Output format definitions
- Determinism guarantees
- Replay test results