"""Vercel entrypoint. Configure secrets through the hosting environment."""
from mvp.app import create_app

app = create_app()
