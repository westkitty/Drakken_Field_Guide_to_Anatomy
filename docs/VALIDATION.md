# Validation Record

## Performed

- Parsed all JSON files with Node.js.
- Ran a local TypeScript syntax and structural check using temporary module declarations because npm packages could not be downloaded in the execution environment.
- Confirmed exactly three specimen records and exactly one record in each required category.
- Confirmed unique specimen IDs and archive IDs.
- Confirmed every record exposes surface, structure, internal, and functional layers.
- Confirmed every record exposes two named animation states.
- Confirmed source code contains no HTTP or HTTPS runtime asset URLs.
- Confirmed no backend, authentication, database, deployment, WebXR, or generative-AI integration was added.

## Not performed

The execution environment could not resolve GitHub or the npm registry. The following remain unverified:

- installed dependency compatibility;
- production Vite build;
- real Vitest execution;
- ESLint execution;
- browser interaction smoke path;
- touch-device behavior;
- screen-reader behavior;
- narrow viewport visual inspection;
- reduced-motion visual inspection;
- repeated specimen-switch resource stabilization;
- WebGL context loss and recovery.

Run the commands in `README.md`, then complete the browser checklist in the original implementation contract.
