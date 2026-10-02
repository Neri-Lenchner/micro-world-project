#!/bin/bash
set -euo pipefail

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    CREATE DATABASE IF NOT EXISTS micro_world_users_db;
    CREATE USER IF NOT EXISTS 'micro_world_auth'@'%' IDENTIFIED BY '${AUTH_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON micro_world_users_db.* TO 'micro_world_auth'@'%';

    CREATE DATABASE IF NOT EXISTS micro_world_catalog_db;
    CREATE USER IF NOT EXISTS 'micro_world_catalog'@'%' IDENTIFIED BY '${CATALOG_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON micro_world_catalog_db.* TO 'micro_world_catalog'@'%';

    CREATE DATABASE IF NOT EXISTS micro_world_orders_db;
    CREATE USER IF NOT EXISTS 'micro_world_order'@'%' IDENTIFIED BY '${ORDER_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON micro_world_orders_db.* TO 'micro_world_order'@'%';

    FLUSH PRIVILEGES;
EOSQL
