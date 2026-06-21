# Python base. "slim" (glibc) is used instead of alpine so the Google Cloud
# client libraries install from prebuilt wheels without a C/C++ toolchain.
FROM python:3.12-slim

# Set the working directory to /app
WORKDIR /app

# Avoid .pyc files and force unbuffered logs (nicer in Cloud Run).
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# copy the requirements file used for dependencies
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the working directory contents into the container at /app
COPY . .

# Cloud Run injects $PORT (default 8080). Serve with gunicorn for production.
ENV PORT=8080
CMD exec gunicorn --bind :$PORT --workers 2 --threads 4 --timeout 60 app:app
