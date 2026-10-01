#!/bin/bash
set -euo pipefail

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    CREATE DATABASE IF NOT EXISTS micro_world_users_db;
    CREATE USER IF NOT EXISTS 'nltech_auth'@'%' IDENTIFIED BY '${AUTH_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON micro_world_users_db.* TO 'nltech_auth'@'%';

    CREATE DATABASE IF NOT EXISTS micro_world_catalog_db;
    CREATE USER IF NOT EXISTS 'nltech_catalog'@'%' IDENTIFIED BY '${CATALOG_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON micro_world_catalog_db.* TO 'nltech_catalog'@'%';

    FLUSH PRIVILEGES;
EOSQL
