import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: ["./dist/db/schema/user.js", "./dist/db/schema/transaction.js"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // pg requires password to be a string; URL without user:pass parses to undefined
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/tigerbeetle",
  },
});
