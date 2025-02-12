FROM postgres:latest

# Set environment variables (these can be overridden in docker-compose)
ENV POSTGRES_USER=user
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=mydb

# Copy the SQL script to the Docker entrypoint initialization folder
COPY init.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL default port
EXPOSE 5432
