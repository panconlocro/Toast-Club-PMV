"""Tests for state machine."""
import pytest
from app.core.state_machine import SessionState, SessionStateMachine


def test_valid_transitions():
    """Test valid state transitions."""
    assert SessionStateMachine.can_transition(SessionState.CREATED, SessionState.READY_TO_START)
    assert SessionStateMachine.can_transition(SessionState.READY_TO_START, SessionState.RUNNING)
    assert SessionStateMachine.can_transition(SessionState.RUNNING, SessionState.AUDIO_UPLOADED)
    assert SessionStateMachine.can_transition(SessionState.AUDIO_UPLOADED, SessionState.SURVEY_PENDING)
    assert SessionStateMachine.can_transition(SessionState.SURVEY_PENDING, SessionState.COMPLETED)


def test_invalid_transitions():
    """Test invalid state transitions."""
    assert not SessionStateMachine.can_transition(SessionState.CREATED, SessionState.RUNNING)
    assert not SessionStateMachine.can_transition(SessionState.COMPLETED, SessionState.CREATED)
    assert not SessionStateMachine.can_transition(SessionState.AUDIO_UPLOADED, SessionState.CREATED)


def test_validate_transition_raises_error():
    """Test that validate_transition raises error for invalid transitions."""
    with pytest.raises(ValueError):
        SessionStateMachine.validate_transition(SessionState.CREATED, SessionState.RUNNING)
