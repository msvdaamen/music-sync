import { and, eq } from "drizzle-orm";
import { DbService } from "../../providers/database";
import { musicConnections, type NewMusicConnectionEntity } from "../../schema";
import type { MusicProvider } from "./types/music-provider.type";

export class MusicConnectionService extends DbService {
  constructor() {
    super();
  }

  async getConnections(userId: string) {
    return await this.database
      .select({
        id: musicConnections.id,
        provider: musicConnections.provider,
        providerUserId: musicConnections.providerUserId,
        providerDisplayName: musicConnections.providerDisplayName,
        createdAt: musicConnections.createdAt,
        updatedAt: musicConnections.updatedAt,
      })
      .from(musicConnections)
      .where(eq(musicConnections.userId, userId));
  }

  async createConnection(connection: NewMusicConnectionEntity) {
    return await this.database.insert(musicConnections).values(connection);
  }

  async deleteConnection(userId: string, provider: MusicProvider) {
    await this.database
      .delete(musicConnections)
      .where(
        and(
          eq(musicConnections.userId, userId),
          eq(musicConnections.provider, provider),
        ),
      );
  }
}

export const musicConnectionService = new MusicConnectionService();
