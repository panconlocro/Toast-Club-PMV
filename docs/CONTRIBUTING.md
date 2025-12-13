# Contributing to Toast Club PMV

Thank you for your interest in contributing to Toast Club PMV! This document provides guidelines and instructions for contributing.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Keep discussions professional and on-topic

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Toast-Club-PMV.git
   cd Toast-Club-PMV
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/panconlocro/Toast-Club-PMV.git
   ```
4. **Set up development environment** (see [SETUP_GUIDE.md](SETUP_GUIDE.md))

## Development Workflow

### 1. Create a feature branch
```bash
git checkout -b feature/your-feature-name
```

Use prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes

### 2. Make your changes
- Follow coding standards (see below)
- Write tests for new functionality
- Update documentation as needed

### 3. Commit your changes
```bash
git add .
git commit -m "Brief description of changes"
```

Commit message format:
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

Examples:
- `feat: Add audio file upload validation`
- `fix: Correct state machine transition validation`
- `docs: Update API documentation for survey endpoints`

### 4. Keep your fork updated
```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push to your fork
```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request
- Go to the original repository on GitHub
- Click "New Pull Request"
- Select your fork and branch
- Fill out the PR template

## Coding Standards

### Python (Backend)

- **Style Guide**: Follow PEP 8
- **Type Hints**: Use type hints for function parameters and return values
- **Docstrings**: Use docstrings for classes and functions
- **Imports**: Group imports (standard library, third-party, local)

Example:
```python
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

def get_session_by_id(
    session_id: int,
    db: Session = Depends(get_db)
) -> Optional[SessionModel]:
    """
    Get a session by its ID.
    
    Args:
        session_id: The session ID to look up
        db: Database session dependency
        
    Returns:
        Session model if found, None otherwise
    """
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()
```

### JavaScript/React (Frontend)

- **Style Guide**: Use consistent formatting
- **Components**: Functional components with hooks
- **Props**: Destructure props in component parameters
- **State**: Use useState and useEffect appropriately
- **Naming**: PascalCase for components, camelCase for functions/variables

Example:
```javascript
function SessionForm({ onSessionCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    edad_aproximada: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
}
```

### General Principles

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **Separation of Concerns**: Keep logic organized and modular

## Testing Guidelines

### Backend Tests

Use pytest for backend tests:

```python
def test_valid_state_transition():
    """Test that valid state transitions are allowed."""
    assert SessionStateMachine.can_transition(
        SessionState.CREATED,
        SessionState.READY_TO_START
    )

def test_invalid_state_transition():
    """Test that invalid state transitions are rejected."""
    with pytest.raises(ValueError):
        SessionStateMachine.validate_transition(
            SessionState.CREATED,
            SessionState.COMPLETED
        )
```

### Test Coverage

- Aim for >80% code coverage
- Test happy paths and edge cases
- Test error conditions
- Mock external dependencies

### Running Tests

```bash
# Backend tests
cd backend
pytest

# With coverage
pytest --cov=app tests/

# Specific test file
pytest tests/test_state_machine.py -v
```

## Pull Request Process

### Before Submitting

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No unnecessary files committed
- [ ] Branch is up-to-date with main

### PR Template

When creating a PR, include:

1. **Description**: What changes were made and why
2. **Related Issues**: Link to related issues
3. **Testing**: How to test the changes
4. **Screenshots**: For UI changes
5. **Checklist**: Confirm all requirements are met

### Review Process

1. Automated checks must pass (if configured)
2. At least one maintainer approval required
3. Address review feedback promptly
4. Squash commits if requested
5. Maintain clean git history

## What to Contribute

### Good First Issues

Look for issues labeled `good-first-issue`:
- Documentation improvements
- Simple bug fixes
- Test additions
- Code cleanup

### Areas for Contribution

- **Backend**: API endpoints, database models, business logic
- **Frontend**: UI components, pages, user experience
- **Testing**: Unit tests, integration tests
- **Documentation**: API docs, guides, examples
- **DevOps**: Docker improvements, CI/CD

### Out of Scope for PMV

Remember, this is a PMV (Minimum Viable Product). The following are **not** in scope:
- Payment/subscription systems
- Multi-tenancy features
- Advanced analytics/dashboards
- AI/ML integration
- Actual VR application (placeholder only)

Focus on core functionality for validating the concept.

## Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Open a new issue with the `question` label
4. Be specific and provide context

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Toast Club PMV! 🎉
