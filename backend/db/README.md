# Database Setup

## PostgreSQL Installation

### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Database Creation

1. **Access PostgreSQL**:
```bash
psql postgres
```

2. **Create database and user**:
```sql
CREATE DATABASE pixel_checker;
CREATE USER pixel_checker_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pixel_checker TO pixel_checker_user;
\c pixel_checker
GRANT ALL ON SCHEMA public TO pixel_checker_user;
```

3. **Run schema**:
```bash
psql -U pixel_checker_user -d pixel_checker -f schema.sql
```

Or from within psql:
```sql
\c pixel_checker
\i schema.sql
```

## Configuration

Update your `/backend/.env` file with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pixel_checker
DB_USER=pixel_checker_user
DB_PASSWORD=your_secure_password
```

## Verify Setup

```sql
-- Check tables were created
\dt

-- Check default organization
SELECT * FROM organizations;
```

## Sample Data (Optional for Testing)

```sql
-- Create test user
INSERT INTO users (org_id, email, password_hash, first_name, last_name, role)
VALUES (1, 'test@example.com', '$2b$10$...hash...', 'Test', 'User', 'admin');

-- Create test sites
INSERT INTO sites (org_id, url, name, gtm_container_id, ga4_measurement_id, meta_pixel_id)
VALUES
  (1, 'https://example.com', 'Example Site', 'GTM-XXXXXX', 'G-XXXXXXXXXX', '123456789'),
  (1, 'https://demo.com', 'Demo Site', 'GTM-YYYYYY', 'G-YYYYYYYYYY', '987654321');
```
