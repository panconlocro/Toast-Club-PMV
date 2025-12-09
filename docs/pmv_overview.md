# Toast Club PMV - Overview

## What is Toast Club?

Toast Club is a Virtual Reality (VR) training platform designed to help users improve their communication skills. The PMV (Minimum Viable Product) focuses on validating the core concept: collecting audio recordings and user feedback from training sessions.

## Purpose of the PMV

The primary goals of this PMV are to:
- Validate the concept of VR-based communication training
- Collect audio recordings from training sessions
- Gather user feedback through surveys
- Build a simple dataset for analysis

## What the PMV is NOT

This PMV explicitly excludes:
- Payment or subscription systems
- Multi-tenancy features
- Complex dashboards or analytics
- AI/ML integration
- Real VR application (placeholder only)
- Production-grade audio storage

## Target Users

### IMPULSADOR (Facilitator)
- Creates training sessions for participants
- Manages the session workflow
- Collects recordings and surveys

### ANALISTA (Analyst)
- Views all training session data
- Exports datasets for analysis
- Monitors platform usage

## Session Workflow

1. **Created**: Session is initialized with participant data
2. **Ready to Start**: Session is prepared for training
3. **Running**: Training in progress, recording can happen
4. **Audio Uploaded**: Recording has been submitted
5. **Survey Pending**: Waiting for participant feedback
6. **Completed**: Session finished with all data collected

## Technology Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React (Vite) + Vanilla CSS
- **Infrastructure**: Docker Compose
- **Authentication**: JWT tokens

## Data Model

### Session
- Participant information (name, age, email)
- Selected training text
- Current state in workflow
- Unique session code

### Recording
- Audio file reference
- Duration and format
- Upload metadata

### Survey
- Participant feedback responses
- JSON format for flexibility

### User
- Email and password
- Role (IMPULSADOR or ANALISTA)

## Future Enhancements (Post-PMV)

- Integration with actual VR application
- Cloud storage for audio files (S3, etc.)
- Advanced analytics dashboard
- AI-powered speech analysis
- Multi-language support
- Mobile app integration
