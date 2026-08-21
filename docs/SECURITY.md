# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.5.x   | :white_check_mark: |
| < 1.5   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. **Preferred**: Use [GitHub's private vulnerability reporting](https://github.com/Aerya/Stremosaic/security/advisories/new)
3. **Alternative**: Email the maintainers directly
4. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution Timeline**: Depends on severity
  - Critical: 24-72 hours
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release

### After Reporting

1. We will investigate and validate the issue
2. We will work on a fix
3. We will release a patched version
4. We will credit you (unless you prefer anonymity)

## Security Best Practices for Users

### Self-Hosting

1. **Use HTTPS** - Always deploy behind a reverse proxy with TLS
2. **Set CORS** - Configure `CORS_ORIGIN` to your specific domain
3. **Protect the database** - Keep PostgreSQL or MongoDB on a private network and enable encryption at rest where available
4. **Keep Updated** - Regularly update to the latest version
5. **Environment Variables** - Never commit `.env` files

### API Keys

- API keys and tokens are encrypted with AES-256-GCM before persistence in PostgreSQL or MongoDB
- Keys are never logged (sanitized automatically)
- Use separate keys for development and production

## Known Security Considerations

### Rate Limiting

API endpoints are limited to 300 requests per minute per IP, sensitive endpoints to 60, monitoring endpoints to 30, and Stremio addon endpoints to 1000. `DISABLE_RATE_LIMIT=true` is honored only in development and test environments.

### TLS Verification

TLS certificate verification is always enabled. Configure trusted corporate proxy certificates with Node's `NODE_EXTRA_CA_CERTS` when needed.

### Public endpoints

Stremio manifest, metadata and catalog routes are public by design, as are Marketplace reads and minimal health/status responses. Configuration reads and every mutation require authentication and ownership checks.

## Scope

### In Scope

- Authentication/authorization bypasses
- Data exposure vulnerabilities
- Injection attacks (SQL, NoSQL, XSS)
- Server-side request forgery (SSRF)
- Denial of service (within reason)

### Out of Scope

- Rate limiting effectiveness
- TMDB API security (report to TMDB)
- Social engineering
- Physical attacks
- Attacks requiring user interaction
