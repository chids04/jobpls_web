# Agent Guidelines for jobpls_web

## Project Status
**This is a potential money-making project.** Utmost care must be taken to the quality of code, security, and correctness of all critical flows.

## Code Quality Standards

- **Simplicity first**: Always reach for the simplest possible implementation. Add complexity only when necessary for performance, not hypothetically.
- **Readability**: Code should be easy to understand. Prefer clear, explicit code over clever implementations.
- **Conciseness**: Keep code lean without sacrificing clarity. Avoid over-engineering or premature abstractions.
- **No unnecessary features**: Don't add error handling, validation, or fallbacks for scenarios that can't happen. Trust framework and internal code guarantees.
- **Comments sparingly**: Only add comments when the WHY is non-obvious. Default to well-named code that speaks for itself.

## Critical Flows - Deep Review Required

Before implementing any of the following flows, you MUST:

1. **Explain the flow in detail** with clear step-by-step breakdowns
2. **Cite authoritative sources** with links so the user can review and verify
3. **Get explicit approval** from the user before writing code

### Flows Requiring Deep Review

- **Authentication flows** (sign-up, login, logout, token refresh, session management)
- **Payment processing** (transactions, subscription handling, refunds, error handling)
- **Authorization & access control** (permission checks, role-based access)
- **User data handling** (storage, retrieval, deletion, privacy compliance)
- **Billing & accounting** (invoice generation, usage tracking, tier upgrades)

## Implementation Approach

1. **Explore existing patterns**: Review the current codebase for established patterns before proposing solutions
2. **Propose before implementing**: For significant changes, outline the approach and wait for user approval
3. **Document assumptions**: State any assumptions about security, performance, or business logic
4. **Test thoroughly**: Test both happy paths and edge cases, especially for auth and payment flows
5. **Security-first mindset**: Validate at system boundaries (user input, external APIs). Be cautious of common vulnerabilities (injection, XSS, CSRF, etc.)

## Sources & References

When proposing auth or payment implementations, link to:
- Official framework documentation
- Industry best practices and RFCs
- Security guidelines (OWASP, etc.)
- Relevant SDKs or libraries
- Trusted third-party guides

Examples:
- Cloudflare Workers auth: [Cloudflare Docs](https://developers.cloudflare.com/workers/)
- OAuth 2.0 standard: [RFC 6749](https://tools.ietf.org/html/rfc6749)
- OWASP Top 10: [owasp.org](https://owasp.org/www-project-top-ten/)

