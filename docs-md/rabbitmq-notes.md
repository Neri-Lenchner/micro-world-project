# RabbitMQ in MicroWorld

## What it's used for

Async messaging between the **Order** and **Catalog** services: when a buyer clicks "Buy now", Order publishes `order.created`, Catalog consumes it and atomically reserves the product (`UPDATE products SET status='sold' WHERE id=? AND status='available'`), then publishes `product.reserved` or `product.reserve-failed` back. Order consumes that reply and resolves the order to `PAID` or `CANCELLED`. See `docs-md/MicroWorld.md` §5.6–5.9 for the original spec.

## Where it runs

A single `rabbitmq:3-management-alpine` container, defined in the root `docker-compose.yml`. Two ports are published to the host:

- **`5672`** — AMQP, the actual messaging protocol. Required even for local non-Docker `pnpm start`, since Catalog and Order both connect to RabbitMQ *before* they start listening on their own HTTP ports.
- **`15672`** — the management web UI, at `http://localhost:15672`. Log in with `RABBITMQ_USER`/`RABBITMQ_PASSWORD` from the root `.env`. Useful for watching the `order.created`/`product.reserved`/`product.reserve-failed` queues live.

## The gotcha: a RabbitMQ outage looks like unrelated failures

Catalog and Order's startup sequence is: connect to MySQL → connect to RabbitMQ → start consuming → *then* start listening on their HTTP port. If RabbitMQ isn't reachable, the connection attempt throws, the whole process crashes before ever opening its port — and **`nodemon` does not auto-restart after a crash**, only when a watched file changes. (The Docker setup doesn't have this problem — `restart: unless-stopped` keeps retrying automatically.)

The practical effect: a dead Catalog (or Order) takes down *all* of its endpoints, including ones that have nothing to do with RabbitMQ — e.g. Gateway logging `ECONNREFUSED` trying to reach Catalog, or the frontend's Browse page coming back empty. If you see that kind of failure during local `pnpm start`, check whether RabbitMQ is actually reachable (`Test-NetConnection -ComputerName localhost -Port 5672`) before debugging anywhere else.

## Local dev vs. Docker

Local `pnpm start` processes and the Docker-composed services can share the same RabbitMQ — the Docker container's `5672` is published to the host specifically so this works. Each local `Backend/*/\.env` needs a `RABBITMQ_URL` that includes the same credentials the Docker container was given (`RABBITMQ_USER`/`RABBITMQ_PASSWORD` in the root `.env`), not the default `guest`/`guest`.
