"""Sanity tests for the validator framework itself."""

import pytest

from theory_validator.observation import Observation, Prediction
from theory_validator.observations import ALL_OBSERVATIONS, OBSERVATIONS_BY_KEY
from theory_validator.runner import run_one
from theory_validator.theories import EXISTING_THEORIES
from theory_validator.theories.unified_holographic_framework import (
    UnifiedHolographicFramework,
)
from theory_validator.theories.recursive_causal_diamond import (
    RecursiveCausalDiamondCosmology,
)
from theory_validator.theories.pure_relational_substrate import (
    PureRelationalSubstrate,
)


def test_unique_observation_keys():
    keys = [o.key for o in ALL_OBSERVATIONS]
    assert len(keys) == len(set(keys)), "observation keys must be unique"


def test_numeric_within_sigma_passes():
    obs = Observation(
        key="t", name="t", domain="test", measured_value=10.0, uncertainty=1.0
    )
    pred = Prediction(value=10.5, uncertainty=0.0)
    ok, _ = obs.check(pred)
    assert ok


def test_numeric_outside_sigma_fails():
    obs = Observation(
        key="t",
        name="t",
        domain="test",
        measured_value=10.0,
        uncertainty=1.0,
        tolerance_sigma=2.0,
    )
    pred = Prediction(value=15.0, uncertainty=0.0)
    ok, _ = obs.check(pred)
    assert not ok


def test_no_prediction_fails():
    obs = Observation(
        key="t", name="t", domain="test", measured_value=10.0, uncertainty=1.0
    )
    ok, reason = obs.check(None)
    assert not ok and "no prediction" in reason


@pytest.mark.parametrize("theory", EXISTING_THEORIES)
def test_existing_theory_matches_documented_expectations(theory):
    """Each existing theory's actual PASS/FAIL profile must match what the
    physics literature says it does. If this fails, the test suite is
    miscalibrated."""
    mismatches = []
    for obs in ALL_OBSERVATIONS:
        r = run_one(theory, obs)
        if not r.expectation_met:
            mismatches.append(
                (obs.key, "PASS" if r.passed else "FAIL", r.expected)
            )
    assert not mismatches, (
        f"{theory.short_name} mismatches: {mismatches}"
    )


def test_rcdc_passes_full_suite():
    """RCDC (speculation-with-structure) must pass every test in the suite.
    If it ever fails, the theory has been falsified."""
    candidate = RecursiveCausalDiamondCosmology()
    failures = []
    for obs in ALL_OBSERVATIONS:
        r = run_one(candidate, obs)
        if not r.passed:
            failures.append((obs.key, r.reason))
    assert not failures, f"RCDC falsified by: {failures}"


def test_uhft_falsified_by_tightened_tests():
    """UHFT (post-hoc curve fit) is *expected* to fail the tightened H0,
    S8, and Li-7 tests. If it stops failing them, either UHFT was edited
    or the tests were loosened -- both are worth flagging."""
    uhft = UnifiedHolographicFramework()
    expected_failures = {
        "hubble_local", "hubble_cmb",
        "sigma_8_lensing", "lithium_7_primordial",
    }
    actually_failed = {
        obs.key for obs in ALL_OBSERVATIONS
        if not run_one(uhft, obs).passed
    }
    assert expected_failures.issubset(actually_failed), (
        f"UHFT no longer falsified by: "
        f"{expected_failures - actually_failed}"
    )


def test_prs_calibration():
    """PRS (rethink-from-scratch) is honestly underspecified -- it should
    fail most tests because the coarse-graining derivations don't exist.
    The calibration check must agree."""
    prs = PureRelationalSubstrate()
    mismatches = [
        obs.key for obs in ALL_OBSERVATIONS
        if not run_one(prs, obs).expectation_met
    ]
    assert not mismatches, f"PRS calibration drifted: {mismatches}"
