import { useEffect, useState } from "react";
import { getUserListApi, type User } from "../api/tigerbeetle";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  console.log(users);

  useEffect(() => {
    let cancelled = false;
    getUserListApi()
      .then((data) => {
        if (!cancelled) setUsers(data.users);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to get user list",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="tb-card w-full ">
      <h2 className="tb-card-title">User List</h2>
      <p className="tb-card-description">List of users</p>
      {loading && <p>Loading users…</p>}
      {error && <p style={{ color: "var(--color-error, #c00)" }}>{error}</p>}
      <div className="tb-table ">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>TigerBeetle Account ID</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th className="w-1/8">Balance</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.tigerbeetleAccountId}</td>
                <td>{user.createdAt}</td>
                <td>{user.updatedAt}</td>
                <td>
                  {user.balance === 0 ? (
                    <span className="text-gray-500">0</span>
                  ) : (
                    user.balance
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
