"""Run all theories against all observations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional

from .observation import Observation, Prediction
from .theory import Theory


@dataclass
class TestResult:
    theory: str
    observation: str
    domain: str
    prediction: Optional[Prediction]
    passed: bool
    reason: str
    expected: str          # "PASS", "FAIL", or "UNKNOWN"
    expectation_met: bool  # actual outcome matches the documented expectation


def run_one(theory: Theory, obs: Observation) -> TestResult:
    pred = theory.predict(obs.key)
    passed, reason = obs.check(pred)
    expected = theory.expected_outcome(obs.key)
    actual = "PASS" if passed else "FAIL"
    expectation_met = expected == "UNKNOWN" or actual == expected
    return TestResult(
        theory=theory.short_name,
        observation=obs.key,
        domain=obs.domain,
        prediction=pred,
        passed=passed,
        reason=reason,
        expected=expected,
        expectation_met=expectation_met,
    )


def run_all(
    theories: Iterable[Theory], observations: Iterable[Observation]
) -> list[TestResult]:
    return [run_one(t, o) for t in theories for o in observations]
