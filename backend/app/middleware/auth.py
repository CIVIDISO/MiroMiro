"""
Simple password protection middleware.
Set APP_PASSWORD in your environment variables.
If not set, the app runs without auth (useful for local dev).
"""

import os
from functools import wraps
from flask import request, Response


def check_auth(password):
    """Check if the provided password matches."""
    return password == os.environ.get('APP_PASSWORD', '')


def authenticate():
    """Send a 401 response that enables basic auth."""
    return Response(
        'Access denied. Please provide the correct password.\n',
        401,
        {'WWW-Authenticate': 'Basic realm="MiroMiro"'}
    )


def require_auth(app):
    """Add basic auth to all routes if APP_PASSWORD is set."""
    app_password = os.environ.get('APP_PASSWORD')
    if not app_password:
        return  # No password set = no auth required (local dev)

    @app.before_request
    def check_password():
        # Skip auth for health check (Railway needs this)
        if request.path == '/health':
            return None

        auth = request.authorization
        if not auth or not check_auth(auth.password):
            return authenticate()
