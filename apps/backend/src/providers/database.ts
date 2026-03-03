import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import { AsyncLocalStorage } from "node:async_hooks";
import { getDatabase } from "../lib/setup";
import { Client } from "pg";

export async function createDatabase(url: string): Promise<NodePgDatabase<typeof schema>> {
  const client = new Client({ connectionString: url });
  await client.connect();

  const db = drizzle(client, {
    casing: "snake_case",
    schema,
  });

  return db;
}

export type DatabaseProvider = NodePgDatabase<typeof schema>;
type TransactionFn = Parameters<DatabaseProvider["transaction"]>;
type TransactionCallbackParam = Parameters<TransactionFn[0]>[0];
const dbTransactionStorage = new AsyncLocalStorage<TransactionCallbackParam>();

export class DbService {
  get database(): Omit<DatabaseProvider, "transaction"> {
    return this.transactionInstance ?? getDatabase();
  }

  private get _database(): DatabaseProvider {
    return this.transactionInstance ?? getDatabase();
  }

  private get transactionInstance(): DatabaseProvider | undefined {
    return dbTransactionStorage.getStore() as DatabaseProvider | undefined;
  }

  async transaction<T>(
    callback: (transaction: TransactionCallbackParam) => Promise<T>,
  ): Promise<T> {
    return await this._database.transaction(async (transaction) => {
      return await dbTransactionStorage.run(transaction, async () => {
        return await callback(transaction);
      });
    });
  }
}
