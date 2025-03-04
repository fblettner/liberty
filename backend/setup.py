from pathlib import Path
from setuptools import setup, find_packages
from setuptools.command.sdist import sdist as _sdist
from setuptools.command.bdist_wheel import bdist_wheel as _bdist_wheel

BASE_DIR = Path(__file__).resolve().parent
VERSION_FILE = BASE_DIR / "VERSION"

def read_requirements():
    req_file = BASE_DIR / "requirements.txt"
    return req_file.read_text().splitlines() if req_file.exists() else []


def read_readme():
    readme_file = BASE_DIR / "README.md"
    return readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

def get_version():
    """Read version from the VERSION file (but don't modify it here)."""
    if not VERSION_FILE.exists():
        return "6.0.0"  # Default version if file doesn't exist
    return VERSION_FILE.read_text().strip()

setup(
    name="liberty-framework",
    version=get_version(),
    description="Liberty Framework",
    author="Franck Blettner",
    author_email="franck.blettner@nomana-it.fr",
    packages=find_packages(),  
    long_description=read_readme(),
    long_description_content_type="text/markdown",
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
    python_requires=">=3.8"
)