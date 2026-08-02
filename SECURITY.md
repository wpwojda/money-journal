# Security Policy

## Threat model

Money Journal is a static, client-side-only application. There is no backend
server, no database, no user accounts, and no network calls that transmit
financial data anywhere. All application state lives in the browser's
`localStorage` on the device where it's opened. Understanding this shapes what
"security" means for this project:

- There is no server to breach and no account credentials to leak, because
  none exist.
- The realistic risks are local to the browser and device: cross-site
  scripting (XSS) that could read `localStorage`, a malicious browser
  extension, physical/device-level access, or a compromised dependency
  introducing unwanted behavior into the bundle.
- `localStorage` is **not encrypted at rest**. Anyone with access to the
  device and browser profile can read the stored JSON. If you need
  encryption at rest, keep the device itself secured (disk encryption, screen
  lock, OS user account).

## Supported versions

Only the latest release on the `main` branch is supported with security
fixes. There is no long-term support branch at this stage of the project.

| Version | Supported |
| ------- | --------- |
| latest  | ✅        |
| older   | ❌        |

## Reporting a vulnerability

If you believe you've found a security issue (for example, an XSS vector, a
way for data to leave the device unexpectedly, or a vulnerable dependency),
please report it privately rather than opening a public issue:

1. Preferred: open a [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) on this repository ("Security" tab → "Report a vulnerability").
2. If that isn't available, open an issue that says only "security issue - please contact me" with no details, and a maintainer will follow up for a private channel.

Please do not include exploit details in a public issue or pull request.

We aim to acknowledge reports within a few days. Since this is a
community-maintained open-source project without dedicated security staff,
response times may vary.

## Dependency vulnerabilities

Run `npm audit` periodically. Because this project has no server and ships as
a static build, most dependency advisories (especially dev-server-only ones
affecting `vite dev`) do not carry the same risk they would for a hosted
backend - but they should still be triaged and updated when a fix is
available without breaking changes.

## A note on privacy as a security property

Money Journal intentionally has no analytics, no telemetry, and no tracking
of any kind. If a future contribution ever proposes adding a network call,
third-party script, or analytics SDK, treat that as a breaking change to the
project's core privacy guarantee, not a routine feature addition - see
`CONTRIBUTING.md`.
