#!/usr/bin/env python3
"""Run every theory against every observation and print a report.

The candidate Unified Holographic Field Theory (UHFT) is validated against
the same observational unit tests we run on the existing theories. The
existing theories are included not as candidates but as calibration: each
one has documented expected PASS/FAIL outcomes per observation, and a
mismatch between expected and actual outcomes flags an error in either the
theory implementation or the test itself.
"""

from __future__ import annotations

import sys

from theory_validator.observations import ALL_OBSERVATIONS, OBSERVATIONS_BY_KEY
from theory_validator.runner import run_all, run_one
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
from theory_validator.theories.discrete_spectral_action import (
    DiscreteSpectralAction,
)
from theory_validator.theories.causal_set_volume_law import (
    CausalSetVolumeLaw,
)
from theory_validator.theories.octonionic_fisher_hypergraph import (
    OctonionicFisherHypergraph,
)


GREEN = "\033[32m"
RED = "\033[31m"
YELLOW = "\033[33m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"


def mark(passed: bool) -> str:
    return f"{GREEN}PASS{RESET}" if passed else f"{RED}FAIL{RESET}"


def print_matrix(theories, observations) -> None:
    print(f"\n{BOLD}== Theory vs Observation matrix =={RESET}\n")
    col_w = max(len(t.short_name) for t in theories) + 2
    header = f"{'observation':40s} " + "".join(
        f"{t.short_name:>{col_w}s}" for t in theories
    )
    print(header)
    print("-" * len(header))
    by_domain: dict[str, list] = {}
    for obs in observations:
        by_domain.setdefault(obs.domain, []).append(obs)
    for domain, obs_list in by_domain.items():
        print(f"{DIM}[{domain}]{RESET}")
        for obs in obs_list:
            row = f"  {obs.key:38s} "
            for theory in theories:
                result = run_one(theory, obs)
                # Highlight expectation mismatches with a marker.
                tag = "*" if not result.expectation_met else " "
                cell = f"{mark(result.passed)}{tag}"
                row += f"{cell:>{col_w + len(GREEN) + len(RESET)}s}"
            print(row)
    print(
        f"\n{DIM}* marks a result that does not match the theory's "
        f"documented expected outcome.{RESET}"
    )


def print_summary(theories, observations) -> None:
    print(f"\n{BOLD}== Summary =={RESET}\n")
    print(f"{'theory':45s} {'pass':>6s} {'fail':>6s} {'expected':>10s} {'mismatch':>10s}")
    print("-" * 80)
    for theory in theories:
        results = [run_one(theory, o) for o in observations]
        n = len(results)
        n_pass = sum(1 for r in results if r.passed)
        n_fail = n - n_pass
        n_expected = sum(1 for r in results if r.expectation_met)
        n_mismatch = n - n_expected
        color = GREEN if n_mismatch == 0 else YELLOW
        print(
            f"{theory.name:45s} {n_pass:6d} {n_fail:6d} "
            f"{n_expected:>10d} {color}{n_mismatch:>10d}{RESET}"
        )


def calibration_check(theories, observations) -> int:
    """Verify each existing theory's actual outcomes match its documented
    expectations. Returns the count of mismatches."""
    mismatches = 0
    print(f"\n{BOLD}== Test-suite calibration =={RESET}\n")
    print("Each existing theory must produce its documented PASS/FAIL profile.")
    for theory in theories:
        bad = []
        for obs in observations:
            r = run_one(theory, obs)
            if not r.expectation_met:
                bad.append((obs.key, "PASS" if r.passed else "FAIL", r.expected))
                mismatches += 1
        status = f"{GREEN}OK{RESET}" if not bad else f"{RED}{len(bad)} mismatches{RESET}"
        print(f"  {theory.short_name:14s} {status}")
        for key, actual, expected in bad:
            print(f"      - {key}: got {actual}, expected {expected}")
    return mismatches


def candidate_verdict(candidate, observations) -> int:
    """Print the verdict for the candidate Unified theory."""
    print(f"\n{BOLD}== Candidate theory: {candidate.name} =={RESET}")
    print(f"{DIM}{candidate.summary}{RESET}\n")
    failed = []
    for obs in observations:
        r = run_one(candidate, obs)
        if not r.passed:
            failed.append((obs, r))
    n_total = len(observations)
    n_failed = len(failed)
    if n_failed == 0:
        print(
            f"  {GREEN}{candidate.short_name} passes all {n_total} unit tests.{RESET}"
        )
        print(
            f"  {DIM}This does not prove the theory; it means it has not yet "
            f"been falsified by this test suite.{RESET}"
        )
    else:
        print(
            f"  {RED}{candidate.short_name} fails {n_failed}/{n_total} "
            f"unit tests:{RESET}"
        )
        for obs, r in failed:
            pv = r.prediction.value if r.prediction else None
            print(
                f"    - {obs.key}: predicted={pv!r}, observed={obs.measured_value!r}  ({r.reason})"
            )
    return n_failed


def main() -> int:
    # Three candidate styles, demonstrating the trilemma:
    #   UHFT -- post-hoc curve fit (passes by construction, falsified by
    #           the tightened tests we added)
    #   RCDC -- speculation-with-structure (one new parameter, claimed
    #           derivations for the four open tensions)
    #   PRS  -- rethink-from-scratch (drops continuum + fields + Lagrangian;
    #           passes very few tests because derivations don't yet exist)
    uhft = UnifiedHolographicFramework()
    rcdc = RecursiveCausalDiamondCosmology()
    prs = PureRelationalSubstrate()
    dsa = DiscreteSpectralAction()
    csvl = CausalSetVolumeLaw()
    ofh = OctonionicFisherHypergraph()
    all_theories = EXISTING_THEORIES + [uhft, rcdc, prs, dsa, csvl, ofh]
    candidate = rcdc  # the one whose verdict we summarize at the end

    print_matrix(all_theories, ALL_OBSERVATIONS)
    print_summary(all_theories, ALL_OBSERVATIONS)
    calibration_mismatches = calibration_check(EXISTING_THEORIES, ALL_OBSERVATIONS)
    candidate_failures = candidate_verdict(candidate, ALL_OBSERVATIONS)

    print()
    if calibration_mismatches:
        print(
            f"{YELLOW}Warning: {calibration_mismatches} calibration mismatches "
            f"-- inspect the test suite.{RESET}"
        )
    if candidate_failures:
        print(
            f"{RED}Candidate falsified on {candidate_failures} test(s).{RESET}"
        )
        return 1
    if calibration_mismatches:
        return 2
    print(f"{GREEN}All checks consistent.{RESET}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
