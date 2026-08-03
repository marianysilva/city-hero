"""Unit tests for app/services/_helpers.py — no database required."""
from app.services._helpers import optional_kwarg


def test_returns_the_key_when_value_is_provided():
    assert optional_kwarg("language", "pt-BR") == {"language": "pt-BR"}


def test_omits_the_key_entirely_when_value_is_none():
    # Omitting the key (not passing language=None) lets the model column's
    # own default apply — see auth_service.register / user_service.create_user.
    assert optional_kwarg("language", None) == {}


def test_spreads_cleanly_into_a_constructor_call():
    class Fake:
        def __init__(self, name: str, language: str = "en-US"):
            self.name = name
            self.language = language

    assert Fake(name="A", **optional_kwarg("language", None)).language == "en-US"
    assert Fake(name="A", **optional_kwarg("language", "pt-BR")).language == "pt-BR"
