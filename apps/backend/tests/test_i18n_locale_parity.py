"""Guards against the backend's supported-language allowlist silently
drifting from packages/i18n's actual locale catalog.

`_validators.py`'s `_SUPPORTED_LANGUAGES` is a hand-maintained Python set with
only a comment tying it to packages/i18n's `SUPPORTED_LOCALES` — nothing
enforces the two stay in sync (Python can't import a TS module). This test
reads the one thing both sides agree is authoritative without either language
needing to parse the other's source: packages/i18n ships one directory per
supported locale under `src/locales/` (`en-US/`, `pt-BR/`), each holding that
locale's JSON dictionaries — see `packages/i18n/src/locales/parity.test.ts`
for the TS-side equivalent (keys match across locales); this test's job is
the sibling one (locale *set* matches across languages).
"""
from pathlib import Path

from app.schemas._validators import _SUPPORTED_LANGUAGES

_LOCALES_DIR = (
    Path(__file__).resolve().parents[3] / "packages" / "i18n" / "src" / "locales"
)


def test_backend_supported_languages_matches_i18n_locale_directories():
    locale_dirs = {p.name for p in _LOCALES_DIR.iterdir() if p.is_dir()}

    assert locale_dirs, f"expected at least one locale directory under {_LOCALES_DIR}"
    assert _SUPPORTED_LANGUAGES == locale_dirs, (
        "apps/backend/app/schemas/_validators.py's _SUPPORTED_LANGUAGES "
        f"({_SUPPORTED_LANGUAGES}) no longer matches packages/i18n's locale "
        f"directories ({locale_dirs}) — update _SUPPORTED_LANGUAGES to match."
    )
