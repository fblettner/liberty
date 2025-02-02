import os
from setuptools import setup, find_packages

def read_requirements():
    """Reads requirements.txt and returns a list of dependencies."""
    req_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
    if os.path.exists(req_file):
        with open(req_file, encoding="utf-8") as f:
            return [line.strip() for line in f if line.strip() and not line.startswith("#")]
    return []

setup(
    name="liberty-framework",
    version="1.0.0",
    description="Liberty Framework",
    author="Franck Blettner",
    author_email="franck.blettner@nomana-it.fr",
    packages=find_packages(),  # Automatically finds all Python packages
    include_package_data=True,
    install_requires=read_requirements(),
    entry_points={
        "console_scripts": [
            "liberty-start=app.main:main",  # Creates a CLI command to start the app
        ]
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "Framework :: FastAPI",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
)