#!/bin/bash
# This file is sourced (not executed) by MySQL's docker-entrypoint.sh, so `set -euo
# pipefail` at the top level would leak into and permanently alter the parent script's
# shell options - which once crashed MySQL's own later code with an unrelated "unbound
# variable" error. Run everything in a subshell so the strict mode stays contained here.
(
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

    CREATE DATABASE IF NOT EXISTS micro_world_watchlist_db;
    CREATE USER IF NOT EXISTS 'micro_world_watchlist'@'%' IDENTIFIED BY '${WATCHLIST_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON micro_world_watchlist_db.* TO 'micro_world_watchlist'@'%';

    CREATE DATABASE IF NOT EXISTS micro_world_payments_db;
    CREATE USER IF NOT EXISTS 'micro_world_payment'@'%' IDENTIFIED BY '${PAYMENT_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON micro_world_payments_db.* TO 'micro_world_payment'@'%';

    CREATE DATABASE IF NOT EXISTS micro_world_notifications_db;
    CREATE USER IF NOT EXISTS 'micro_world_notification'@'%' IDENTIFIED BY '${NOTIFICATION_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON micro_world_notifications_db.* TO 'micro_world_notification'@'%';

    CREATE DATABASE IF NOT EXISTS micro_world_analytics_db;
    CREATE USER IF NOT EXISTS 'micro_world_analytics'@'%' IDENTIFIED BY '${ANALYTICS_DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON micro_world_analytics_db.* TO 'micro_world_analytics'@'%';

    FLUSH PRIVILEGES;
EOSQL
)
