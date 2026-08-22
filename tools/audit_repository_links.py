#!/usr/bin/env python3
"""Audit current public documentation links without adding a package dependency."""

from __future__ import annotations

import json
import re
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "evidence" / "REPOSITORY-LINK-AUDIT-v0.8.1.json"

CURRENT_FILES = [
    ROOT / "README.md",
    ROOT / "CODE-OVERVIEW.md",
    ROOT / "EVIDENCE-INDEX.md",
    ROOT / "RELEASE-NOTES.md",
    ROOT / "TESTING.md",
    ROOT / "THIRD_PARTY_NOTICES.md",
    ROOT / "docs" / "ACCESSIBILITY-EVIDENCE-BOUNDARY.md",
    ROOT / "docs" / "AI-ASSISTED-DEVELOPMENT-NOTES.md",
    ROOT / "docs" / "AQP-FINAL-CONTRIBUTION-v2.md",
    ROOT / "docs" / "CLAIM-NAMING-DECISION-v1.md",
    ROOT / "docs" / "CUSTOM-QUESTIONNAIRE-TEST.md",
    ROOT / "docs" / "INSTRUMENT-DEFINITION-GUIDE.md",
    ROOT / "docs" / "PLANNED-STUDY-NOT-EXECUTED.md",
    ROOT / "docs" / "QUALTRICS-INTEGRATION.md",
    ROOT / "docs" / "QUESTIONNAIRE-IMPORT.md",
    ROOT / "docs" / "QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md",
    ROOT / "docs" / "REMOTE-COLLECTION-AND-PERMISSIONS.md",
    ROOT / "docs" / "REPOSITORY-CURATION-v0.8.1.md",
    ROOT / "docs" / "SOURCE-VERIFICATION-A1-F4.md",
    ROOT / "docs" / "STUDY-WORKFLOW.md",
    ROOT / "docs" / "TECHNICAL-EVALUATION-PROTOCOL-v1.0.md",
    ROOT / "docs" / "TECHNICAL-RISK-REGISTER.md",
    ROOT / "docs" / "WCAG-2.2-COMPONENT-AUDIT.md",
    ROOT / "integrations" / "qualtrics" / "README.md",
    ROOT / "source" / "README.md",
    ROOT / "source" / "demo" / "README.md",
    ROOT / "source" / "tests" / "README.md",
]

MARKDOWN_LINK = re.compile(r"!?\[[^\]]*\]\(([^)\s]+)(?:\s+['\"][^'\"]*['\"])?\)")
RAW_URL = re.compile(r"https?://[^\s<>`\]\)\}\"']+")

SKIP_PREFIXES = (
    "http://127.0.0.1",
    "http://localhost",
    "https://example.invalid",
)


@dataclass
class Check:
    source: str
    target: str
    kind: str
    status: str
    detail: str = ""


def current_files() -> list[Path]:
    missing = [str(path.relative_to(ROOT)) for path in CURRENT_FILES if not path.exists()]
    if missing:
        raise SystemExit(f"Current-document inventory contains missing files: {missing}")
    return CURRENT_FILES


def targets(path: Path) -> set[str]:
    text = path.read_text(encoding="utf-8")
    found = {match.group(1).strip() for match in MARKDOWN_LINK.finditer(text)}
    found.update(match.group(0).rstrip(".,;:") for match in RAW_URL.finditer(text))
    return found


def internal_check(source: Path, target: str) -> Check:
    clean = unquote(target.split("#", 1)[0].split("?", 1)[0])
    if not clean:
        return Check(str(source.relative_to(ROOT)), target, "internal", "ok", "same-document anchor")
    resolved = (source.parent / clean).resolve()
    try:
        resolved.relative_to(ROOT)
    except ValueError:
        return Check(str(source.relative_to(ROOT)), target, "internal", "failed", "path leaves repository")
    if resolved.is_dir():
        resolved = resolved / "README.md"
    return Check(
        str(source.relative_to(ROOT)),
        target,
        "internal",
        "ok" if resolved.exists() else "failed",
        str(resolved.relative_to(ROOT)) if resolved.exists() else "target does not exist",
    )


def external_check(source: Path, target: str) -> Check:
    if target.startswith(SKIP_PREFIXES):
        return Check(str(source.relative_to(ROOT)), target, "external", "skipped", "local or deliberate invalid test URL")

    request = Request(
        target,
        headers={"User-Agent": "AQP-repository-link-audit/0.8.1"},
        method="GET",
    )
    last_error = ""
    for attempt in range(3):
        try:
            with urlopen(request, timeout=25) as response:
                code = int(getattr(response, "status", 200))
                return Check(
                    str(source.relative_to(ROOT)),
                    target,
                    "external",
                    "ok" if 200 <= code < 400 else "failed",
                    f"HTTP {code}",
                )
        except HTTPError as error:
            # Authentication and anti-bot boundaries still establish that the host and path resolve.
            if error.code in {401, 403, 405, 429}:
                return Check(
                    str(source.relative_to(ROOT)),
                    target,
                    "external",
                    "reachable-with-boundary",
                    f"HTTP {error.code}",
                )
            last_error = f"HTTP {error.code}"
        except (URLError, TimeoutError, ValueError) as error:
            last_error = str(error)
        if attempt < 2:
            time.sleep(2 ** attempt)
    return Check(str(source.relative_to(ROOT)), target, "external", "failed", last_error)


def main() -> int:
    checks: list[Check] = []
    seen_external: dict[str, Check] = {}

    for source in current_files():
        for target in sorted(targets(source)):
            parsed = urlparse(target)
            if parsed.scheme in {"http", "https"}:
                if target not in seen_external:
                    seen_external[target] = external_check(source, target)
                result = seen_external[target]
                checks.append(
                    Check(
                        str(source.relative_to(ROOT)),
                        target,
                        result.kind,
                        result.status,
                        result.detail,
                    )
                )
            elif parsed.scheme in {"mailto", "tel"} or target.startswith("#"):
                checks.append(Check(str(source.relative_to(ROOT)), target, "other", "skipped"))
            else:
                checks.append(internal_check(source, target))

    failures = [check for check in checks if check.status == "failed"]
    report = {
        "schemaVersion": 1,
        "release": "v0.8.1",
        "scope": "current public documentation; docs/archive is excluded",
        "filesChecked": len(current_files()),
        "linksChecked": len(checks),
        "uniqueExternalLinks": len(seen_external),
        "failures": len(failures),
        "checks": [asdict(check) for check in checks],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if failures:
        for failure in failures:
            print(f"BROKEN {failure.source}: {failure.target} ({failure.detail})", file=sys.stderr)
        return 1
    print(
        f"Checked {report['linksChecked']} links across {report['filesChecked']} current documents; no failures."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
