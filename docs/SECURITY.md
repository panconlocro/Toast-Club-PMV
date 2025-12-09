# Security Checklist for Production Deployment

## ⚠️ IMPORTANT: Before Deploying to Production

This document outlines critical security considerations for deploying Toast Club PMV to production.

## 🔒 Authentication & Secrets

### Secret Key (CRITICAL)
- [ ] **Change `SECRET_KEY`** in `.env` file
- [ ] Generate a cryptographically secure key:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] Never commit the production secret key to version control
- [ ] Use environment variables or secret management systems

### Passwords
- [ ] **Change default user passwords**
- [ ] Use strong passwords (min 12 characters, mixed case, numbers, symbols)
- [ ] Consider implementing password complexity requirements
- [ ] Add password reset functionality

### Database Credentials
- [ ] **Change default PostgreSQL credentials**
- [ ] Use strong, unique passwords
- [ ] Don't use default usernames like 'postgres' or 'toastclub'
- [ ] Restrict database access to backend only

## 🌐 CORS Configuration

### Current Development Setting
```python
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]
```

### Production Configuration
- [ ] Update `CORS_ORIGINS` to your actual domain(s)
- [ ] Never use `["*"]` (allow all origins) in production
- [ ] Include only HTTPS URLs
- [ ] Example:
  ```python
  CORS_ORIGINS = ["https://yourdomain.com", "https://app.yourdomain.com"]
  ```

## 🔐 HTTPS/SSL

- [ ] **Enable HTTPS** for all production traffic
- [ ] Obtain SSL/TLS certificate (Let's Encrypt, etc.)
- [ ] Redirect all HTTP traffic to HTTPS
- [ ] Configure reverse proxy (Nginx, Caddy, etc.)
- [ ] Set secure cookie flags:
  ```python
  SESSION_COOKIE_SECURE = True
  CSRF_COOKIE_SECURE = True
  ```

## 🛡️ Headers & Middleware

### Security Headers
Add these headers to your reverse proxy or FastAPI middleware:
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Content-Security-Policy`

Example Nginx configuration:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## 🚦 Rate Limiting

### API Rate Limiting
- [ ] Implement rate limiting on authentication endpoints
- [ ] Limit login attempts (e.g., 5 per minute per IP)
- [ ] Rate limit session creation
- [ ] Consider using tools like:
  - slowapi (FastAPI)
  - Redis-based rate limiting
  - Nginx rate limiting

Example:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

## 📝 Logging & Monitoring

### Logging
- [ ] **Disable SQL query logging** in production (`echo=False` in database config)
- [ ] Log authentication events (login, logout, failures)
- [ ] Log state transitions
- [ ] Don't log sensitive data (passwords, tokens, PII)
- [ ] Set up log rotation

### Monitoring
- [ ] Monitor failed login attempts
- [ ] Alert on unusual activity patterns
- [ ] Track API error rates
- [ ] Monitor database performance

## 🗄️ Database Security

### PostgreSQL Configuration
- [ ] Use PostgreSQL (not SQLite) in production
- [ ] Enable SSL connections
- [ ] Restrict network access (firewall rules)
- [ ] Regular backups
- [ ] Encrypt backups
- [ ] Test restore procedures

### Connection Security
```python
# Example DATABASE_URL with SSL
DATABASE_URL = "postgresql://user:pass@host:5432/dbname?sslmode=require"
```

## 📁 File Upload Security

### Audio File Uploads (Future Implementation)
- [ ] Validate file types (whitelist extensions)
- [ ] Limit file size (MAX_AUDIO_SIZE_MB)
- [ ] Scan for malware
- [ ] Store files outside webroot
- [ ] Use cloud storage (S3, GCS) with signed URLs
- [ ] Generate unique filenames (prevent overwrites)
- [ ] Set proper file permissions

Example validation:
```python
ALLOWED_EXTENSIONS = {'.wav', '.mp3', '.m4a'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

def validate_audio_file(file):
    # Check extension
    # Check size
    # Verify MIME type
    # Scan content
```

## 🔑 JWT Token Security

### Token Configuration
- [ ] Set appropriate token expiration (ACCESS_TOKEN_EXPIRE_MINUTES)
- [ ] Consider refresh tokens for long-lived sessions
- [ ] Implement token revocation/blacklist
- [ ] Store tokens securely on client (not localStorage for sensitive apps)

### Token Validation
```python
# Current implementation validates:
- Token signature
- Token expiration
- User existence

# Consider adding:
- Token revocation check
- Device fingerprinting
- IP validation
```

## 🚫 Input Validation

### Backend Validation
- [ ] All Pydantic models validate input
- [ ] Email format validation (already implemented)
- [ ] Age range validation (1-120)
- [ ] Text length limits
- [ ] SQL injection prevention (SQLAlchemy parameterized queries ✅)

### Frontend Validation
- [ ] Client-side validation for UX
- [ ] Never trust client input
- [ ] Always validate on backend

## 🔍 Code Security

### Dependencies
- [ ] Keep dependencies updated
- [ ] Run security audits:
  ```bash
  # Python
  pip install safety
  safety check
  
  # Node.js
  npm audit
  ```
- [ ] Subscribe to security advisories

### Code Review
- [ ] Review code for security issues
- [ ] Use static analysis tools (Bandit, ESLint)
- [ ] Scan for secrets in git history

## 🧪 Testing

### Security Testing
- [ ] Test authentication flows
- [ ] Test authorization (role checks)
- [ ] Test state machine transitions
- [ ] Test input validation
- [ ] Penetration testing (if budget allows)

## 📊 Data Privacy

### GDPR/Privacy Compliance (if applicable)
- [ ] Privacy policy
- [ ] Data retention policy
- [ ] User consent mechanisms
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Encrypt sensitive data at rest

### PII Handling
Currently storing:
- Names
- Ages (approximate)
- Emails (optional)
- Audio recordings

- [ ] Inform users about data collection
- [ ] Provide data access/deletion options
- [ ] Minimize data collection
- [ ] Secure data transmission

## 🐳 Docker Security

### Container Security
- [ ] Use specific image versions (not `latest`)
- [ ] Scan images for vulnerabilities:
  ```bash
  docker scan toastclub-backend
  docker scan toastclub-frontend
  ```
- [ ] Run containers as non-root user
- [ ] Limit container capabilities
- [ ] Use Docker secrets for sensitive data

### Docker Compose Production
- [ ] Use separate production compose file
- [ ] Don't mount source code volumes
- [ ] Use environment files securely
- [ ] Limit exposed ports

## 🌍 Deployment Environment

### Server Hardening
- [ ] Keep OS updated
- [ ] Configure firewall (UFW, iptables)
- [ ] Disable unnecessary services
- [ ] SSH key-only authentication
- [ ] Fail2ban or similar
- [ ] Regular security updates

### Reverse Proxy
- [ ] Use Nginx or Caddy as reverse proxy
- [ ] Configure SSL/TLS properly
- [ ] Set security headers
- [ ] Rate limiting
- [ ] Request size limits

Example Nginx config:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Backend proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## ✅ Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] SECRET_KEY changed
- [ ] Database credentials changed
- [ ] CORS_ORIGINS updated
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] SQL logging disabled
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Dependencies updated
- [ ] Security scan completed
- [ ] Code review done
- [ ] Testing completed

## 🆘 Incident Response

### If Security Breach Occurs:
1. Isolate affected systems
2. Change all credentials immediately
3. Review logs for extent of breach
4. Notify affected users (if PII exposed)
5. Document incident
6. Implement fixes
7. Post-mortem analysis

### Emergency Contacts
- [ ] Define security incident response team
- [ ] Prepare communication templates
- [ ] Know legal requirements (data breach notifications)

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

## 🔄 Regular Maintenance

### Monthly
- [ ] Review access logs
- [ ] Update dependencies
- [ ] Check for security advisories
- [ ] Verify backups

### Quarterly
- [ ] Security audit
- [ ] Penetration testing (if applicable)
- [ ] Review and update passwords
- [ ] Review user permissions

---

**Remember: Security is an ongoing process, not a one-time task.**

For questions or to report security issues, please contact the security team immediately.
