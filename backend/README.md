# Backend

## How to start the project

The backend depends on **TigerBeetle** (ledger) and **PostgreSQL** (users/transactions). Start them before the backend.

### 1. Start TigerBeetle (required)

The backend connects to TigerBeetle at `127.0.0.1:3000` (`TB_ADDRESS=3000`). If TigerBeetle isn’t running, you’ll see:

```text
warning(message_bus): ... on_connect: error to=0 error.ConnectionRefused
```

**First-time setup (macOS):**

```bash
# From project root or any directory
curl -Lo tigerbeetle.zip https://mac.tigerbeetle.com && unzip -o tigerbeetle.zip
./tigerbeetle version
```

**Format a data file (once per cluster):**

```bash
./tigerbeetle format --cluster=0 --replica=0 --replica-count=1 --development ./0_0.tigerbeetle
```

**Start TigerBeetle (leave this running in a terminal):**

```bash
./tigerbeetle start --addresses=3000 --development ./0_0.tigerbeetle
```

### 2. Start PostgreSQL

Ensure PostgreSQL is running and that the database in `DATABASE_URL` exists (e.g. `createdb my_database` or use your existing DB).

### 3. Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend will be at `http://localhost:4000`.

### 4. (Optional) Start the frontend

```bash
cd my-app
npm install
npm run dev
```

---

**Quick reference:** Run TigerBeetle in one terminal, then `npm run dev` in `backend/`. The `message_bus` / `ConnectionRefused` warnings stop once TigerBeetle is listening on port 3000.

---

### PgLedger API (optional)

The backend exposes a **PgLedger** API under `/api/pgledger` for accounts and transfers backed by PostgreSQL only (no TigerBeetle). To use it:

1. Apply the pgledger schema to your database (e.g. run `pgledger/pgledger.sql` and any required ULID/vendor SQL against the same `DATABASE_URL` database).
2. Use the frontend “PgLedger” dashboard (switch via the button in the app header).

Endpoints: `POST /api/pgledger/accounts`, `GET /api/pgledger/accounts`, `GET /api/pgledger/accounts/:id`, `GET /api/pgledger/accounts/:id/transfers`, `POST /api/pgledger/transfers`, `POST /api/pgledger/topup`. Top-up uses an auto-created “Treasury” account or `PGLEDGER_TREASURY_ACCOUNT_ID` if set.

---

`npm run db:studio:4984` — Drizzle Studio on port 4984.
