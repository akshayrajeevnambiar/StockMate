from setuptools import setup, find_packages

setup(
    name="pantrypal",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "sqlalchemy",
        "pydantic",
        "pydantic-settings",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-multipart",
        "alembic",
        "psycopg2-binary",
        "email-validator",
    ]
)