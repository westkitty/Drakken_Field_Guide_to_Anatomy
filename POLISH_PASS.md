# Polish Pass

This pass is bounded to presentation, interaction finish, accessibility, responsive behavior, and examination feedback. It does not alter the closed 59-record inventory, dedicated model routes, canon data, asset policy, or renderer architecture.

## Initial implementation — 40 improvements

- **P01** — Correct registry handle mnemonic
- **P02** — Expand invisible edge-handle targets
- **P03** — Respect display safe areas
- **P04** — Clarify open handle state
- **P05** — Connect triggers and drawers semantically
- **P06** — Make diagnostics mutually exclusive
- **P07** — Include diagnostics in dismissal behavior
- **P08** — Use sticky drawer headings
- **P09** — Contain and polish drawer scrolling
- **P10** — Use typographic close controls
- **P11** — Show live registry result totals
- **P12** — Provide one-click search clearing
- **P13** — Provide one-click filter reset
- **P14** — Expose active and loading record states
- **P15** — Provide recoverable registry empty state
- **P16** — Expose chamber loading state
- **P17** — Polish reconstruction loading feedback
- **P18** — Provide retryable load failure feedback
- **P19** — Surface non-default examination modes
- **P20** — Confirm completed actions with live feedback
- **P21** — Reset all examination tools
- **P22** — Add anatomy visibility presets
- **P23** — Show visible anatomy layer count
- **P24** — Disable unavailable section controls
- **P25** — Describe range values accessibly
- **P26** — Disable unavailable measurement clearing
- **P27** — Number measurement points and improve guidance
- **P28** — Add bulk annotation export controls
- **P29** — Use semantic record tabs
- **P30** — Expose annotation counts during export
- **P31** — Allow explicit and backdrop briefing dismissal
- **P32** — Expand shortcut and motion guidance
- **P33** — Describe chamber controls to assistive technology
- **P34** — Use context-sensitive viewport cursors
- **P35** — Add restrained viewport depth treatment
- **P36** — Polish mobile tools sheet handling
- **P37** — Normalize finish tokens and interaction states
- **P38** — Provide coarse-pointer action targets
- **P39** — Respect reduced-motion preferences
- **P40** — Add durable polish regression coverage

## Adversarial critique

The initial result was deliberately reviewed as if it were a hostile release candidate rather than accepted because it looked more finished. The review found:

1. **Blocker:** the new test imported Node's file system module even though this browser project does not install Node type declarations. TypeScript correctly rejected it.
2. **Major:** drawers transferred focus on open but did not contain it, allowing keyboard navigation behind the modal scrim. Diagnostics was excluded from even the initial focus transfer.
3. **Major:** direct drawer close buttons hid their focused container without restoring focus to the trigger.
4. **Major:** Diagnostics had both an edge trigger and a second internal toggle, making it feel like a leftover widget rather than part of the drawer system.
5. **Major:** the search clear button was nested inside the search label, creating ambiguous label activation and invalid interaction structure.
6. **Major:** record tabs declared tab semantics but omitted the keyboard behavior those semantics promise.
7. **Minor:** the full tool reset callback depended on an animation array rather than a stable primitive.
8. **Minor:** retrying a failure for the already active record could no-op at the existing early-return guard.
9. **Major:** selecting an annotation for inspection also silently changed export membership, conflating two independent user intentions.

## Implemented adversarial repairs

- **A01** — Remove Node-only APIs from browser-project tests
- **A02** — Trap keyboard focus inside every open drawer
- **A03** — Restore trigger focus from every drawer close action
- **A04** — Make diagnostics use the same drawer language as the rest of the interface
- **A05** — Separate search labelling from its clear action
- **A06** — Complete arrow, Home, and End keyboard behavior for record tabs
- **A07** — Stabilize tool reset dependencies
- **A08** — Make retry behavior deterministic for current and alternate records
- **A09** — Separate annotation inspection from export inclusion

## Evidence status

- Source/build validation: pending exact repaired head.
- Browser interaction and responsive polish: pending targeted browser audit.
- Human art-direction approval: remains outside this polish pass.
