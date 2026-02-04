from enum import Enum
from typing import Set, Dict


class SessionState(str, Enum):
    """Session states for the workflow."""
    CREATED = "created"
    READY_TO_START = "ready_to_start"
    RUNNING = "running"
    AUDIO_UPLOADED = "audio_uploaded"
    SURVEY_PENDING = "survey_pending"
    COMPLETED = "completed"


class SessionStateMachine:
    """State machine for session workflow."""
    
    # Define valid state transitions
    TRANSITIONS: Dict[SessionState, Set[SessionState]] = {
        SessionState.CREATED: {SessionState.READY_TO_START},
        SessionState.READY_TO_START: {SessionState.RUNNING},
        SessionState.RUNNING: {SessionState.AUDIO_UPLOADED},
        SessionState.AUDIO_UPLOADED: {SessionState.SURVEY_PENDING},
        SessionState.SURVEY_PENDING: {SessionState.COMPLETED},
        SessionState.COMPLETED: set(),  # Final state, no transitions
    }
    
    @classmethod
    def can_transition(cls, from_state: SessionState, to_state: SessionState) -> bool:
        """Check if a state transition is valid."""
        if from_state not in cls.TRANSITIONS:
            return False
        return to_state in cls.TRANSITIONS[from_state]
    
    @classmethod
    def get_next_states(cls, current_state: SessionState) -> Set[SessionState]:
        """Get all valid next states from current state."""
        return cls.TRANSITIONS.get(current_state, set())
    
    @classmethod
    def validate_transition(cls, from_state: SessionState, to_state: SessionState) -> None:
        """Validate a state transition, raise exception if invalid."""
        if not cls.can_transition(from_state, to_state):
            raise ValueError(
                f"Invalid state transition from {from_state} to {to_state}. "
                f"Valid next states: {cls.get_next_states(from_state)}"
            )
