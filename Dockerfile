FROM python:3

# Set the working directory inside the container
WORKDIR /app

# Copy the necessary files into the container
COPY ./backend/database/pc_miler_api.py ./pc_miler_api.py

# Install the required Python packages
RUN pip install --no-cache-dir requests urllib3 backoff

# Command to run the script
CMD ["python", "./pc_miler_api.py"]
