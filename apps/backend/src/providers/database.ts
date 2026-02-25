import { AsyncLocalStorage } from "node:async_hooks";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../schema";

export type DatabaseProvider = ReturnType<typeof drizzle<typeof schema>>;

export const db = drizzle(process.env.DATABASE_URL!, {
  casing: "snake_case",
  schema,
});

type TransactionFn = Parameters<DatabaseProvider["transaction"]>;
type TransactionCallbackParam = Parameters<TransactionFn[0]>[0];
const dbTransactionStorage = new AsyncLocalStorage<TransactionCallbackParam>();

export class DbService {
  get database(): Omit<DatabaseProvider, "transaction"> {
    return this.transactionInstance ?? db;
  }

  private get _database(): DatabaseProvider {
    return db;
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
