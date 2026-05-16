"""Base class for candidate physics theories."""

from __future__ import annotations

from typing import Optional

from .observation import Prediction


class Theory:
    """A candidate theory makes predictions for observation keys.

    Subclasses populate `predictions` with key -> Prediction. They also
    populate `expected_outcomes` with key -> "PASS" or "FAIL" reflecting the
    documented physics-consensus result. The runner uses this to validate the
    test suite itself: if a theory's actual outcome on a test does not match
    the expected outcome, either the theory implementation is wrong or the
    test is miscalibrated.
    """

    name: str = "unnamed theory"
    short_name: str = "theory"
    summary: str = ""

    def __init__(self) -> None:
        self.predictions: dict[str, Prediction] = {}
        self.expected_outcomes: dict[str, str] = {}
        self._build()

    def _build(self) -> None:
        """Subclasses fill `predictions` and `expected_outcomes` here."""
        raise NotImplementedError

    def predict(self, observation_key: str) -> Optional[Prediction]:
        return self.predictions.get(observation_key)

    def expected_outcome(self, observation_key: str) -> str:
        """Returns 'PASS', 'FAIL', or 'UNKNOWN' for the given observation."""
        return self.expected_outcomes.get(observation_key, "UNKNOWN")
