-- Initialize database tables
-- This file is automatically executed when PostgreSQL container starts

-- No need to create database - it's created via POSTGRES_DB env var
-- Just log that initialization is complete

SELECT 'Database initialization script executed' as status;
