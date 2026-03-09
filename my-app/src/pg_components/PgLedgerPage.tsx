import { Link } from "react-router-dom";
import Dashboard from "./Dashboard";

export default function PgLedgerPage() {
  return (
    <div className="tb-root">
      <div className="flex justify-end gap-2">
        <Link
          to="/"
          className="tb-button tb-button-primary"
          aria-pressed={true}
        >
          TigerBeetle
        </Link>
      </div>
      <Dashboard />
    </div>
  );
}
