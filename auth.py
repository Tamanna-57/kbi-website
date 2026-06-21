"""Authentication for the KBI admin panel.

Per the agreed design there is a *single shared admin login* — multiple people
sign in with the same credential and edit through the one admin panel. There
are no per-user accounts.

This module is intentionally a thin, swappable seam: if the login mechanism
later changes (e.g. Google sign-in, per-user accounts), only this file and the
login route need to change — the ``login_required`` decorator and
``is_admin`` check stay the same everywhere else.

Configuration (environment variables):
* ``ADMIN_PASSWORD`` — the shared password. If unset, a development default
  ("kbi-admin") is used and a warning is printed; never rely on the default in
  production.
* ``SECRET_KEY`` — Flask session signing key. A random key is generated per
  process if unset (which logs everyone out on restart — fine for dev).
"""

import functools
import os

from flask import redirect, request, session, url_for

_SESSION_KEY = "is_admin"
_DEV_PASSWORD = "kbi-admin"


def get_admin_password():
    return os.environ.get("ADMIN_PASSWORD") or _DEV_PASSWORD


def using_default_password():
    return not os.environ.get("ADMIN_PASSWORD")


def check_password(candidate):
    """Constant-time-ish comparison of a submitted password."""
    import hmac

    expected = get_admin_password()
    return hmac.compare_digest((candidate or "").encode(), expected.encode())


def login(session_obj=session):
    session_obj[_SESSION_KEY] = True
    session_obj.permanent = True


def logout(session_obj=session):
    session_obj.pop(_SESSION_KEY, None)


def is_admin():
    """True when the current request is from a logged-in admin."""
    return bool(session.get(_SESSION_KEY))


def login_required(view):
    """Protect a view. Browser requests redirect to login; API requests 401."""

    @functools.wraps(view)
    def wrapped(*args, **kwargs):
        if not is_admin():
            wants_json = request.path.startswith("/api/") or request.is_json
            if wants_json:
                from flask import jsonify

                return jsonify({"error": "authentication required"}), 401
            return redirect(url_for("admin_login", next=request.path))
        return view(*args, **kwargs)

    return wrapped
