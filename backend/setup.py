import os
import shutil
from setuptools import setup, find_packages
from setuptools.command.sdist import sdist as _sdist
from setuptools.command.bdist_wheel import bdist_wheel as _bdist_wheel

DIST_DIR = "dist"
ARCHIVE_DIR = "dist/archive"

def read_requirements():
    """Reads requirements.txt and returns a list of dependencies."""
    req_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
    if os.path.exists(req_file):
        with open(req_file, encoding="utf-8") as f:
            return [line.strip() for line in f if line.strip() and not line.startswith("#")]
    return []

def get_version():
    """Read and increment the version number from VERSION file."""
    version_file = "VERSION"
    
    if not os.path.exists(version_file):
        return "6.1.0"  # Default version if file does not exist

    with open(version_file, "r") as f:
        version = f.read().strip()

    # Increment the last number (patch version)
    major, minor, patch = map(int, version.split("."))
    patch += 1  # Increment last digit

    new_version = f"{major}.{minor}.{patch}"

    # Write new version back to file
    with open(version_file, "w") as f:
        f.write(new_version)

    return new_version

def archive_old_builds():
    """Move old .tar.gz builds to an archive folder before building."""
    os.makedirs(ARCHIVE_DIR, exist_ok=True)  # Ensure archive folder exists

    for file in os.listdir(DIST_DIR):
        if file.endswith(".tar.gz"):
            shutil.move(os.path.join(DIST_DIR, file), os.path.join(ARCHIVE_DIR, file))  
        if file.endswith(".whl"):
            shutil.move(os.path.join(DIST_DIR, file), os.path.join(ARCHIVE_DIR, file))              

archive_old_builds()

setup(
    name="liberty-framework",
    version=get_version(),
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
    python_requires=">=3.8"
)