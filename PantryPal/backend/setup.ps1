# Run this script to create and initialize the Python environment

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env (you'll need to edit this with your settings)
Copy-Item .env.example .env

Write-Host "Environment setup complete!"
Write-Host "Please edit the .env file with your database and other settings."
Write-Host "Then run 'alembic upgrade head' to initialize the database."