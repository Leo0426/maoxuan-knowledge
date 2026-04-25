from setuptools import find_packages, setup

setup(
    name="maoxuan-knowledge-backend",
    version="0.1.0",
    description="FastAPI backend for MaoXuan Knowledge Timeline",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "fastapi>=0.111.0",
        "sqlmodel>=0.0.21",
        "uvicorn[standard]>=0.30.0",
        "pydantic>=2.7.0",
        "python-dotenv>=1.0.1",
    ],
)
