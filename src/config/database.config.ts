import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { EnvironmentVariables } from './env.config';

/**
 * Determines whether a server string refers to a MongoDB Atlas SRV cluster.
 *
 * Atlas hostnames look like:  cluster0.hawlfvs.mongodb.net
 * Self-hosted looks like:     localhost:27017  or  192.168.1.10:27017
 *
 * Rule: if the value has NO explicit port and is not localhost/127.x,
 *       treat it as an Atlas SRV host → use mongodb+srv://
 */
function isAtlasSrvHost(server: string): boolean {
  const hasPort = /:\d+$/.test(server); // ends with :PORT
  const isLocal =
    server.startsWith('localhost') || server.startsWith('127.');
  return !hasPort && !isLocal;
}

/**
 * Builds the correct MongoDB connection URI from the four env variables.
 *
 * | DB_SERVER value                      | Scheme used    |
 * |--------------------------------------|----------------|
 * | mongodb+srv://... (full URI)         | kept as-is     |
 * | mongodb://...    (full URI)          | kept as-is     |
 * | cluster0.xxx.mongodb.net  (no port)  | mongodb+srv:// |
 * | localhost:27017  (has port)          | mongodb://     |
 */
function buildMongoUri(
  user: string,
  password: string,
  server: string,
  dbName: string,
): string {
  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);

  // Case 1 — caller already provided a full URI with scheme
  if (server.startsWith('mongodb://') || server.startsWith('mongodb+srv://')) {
    return server.replace(
      /^(mongodb(?:\+srv)?:\/\/)/,
      `$1${encodedUser}:${encodedPassword}@`,
    );
  }

  // Case 2 — Atlas SRV hostname (no port, not localhost)
  //   → mongodb+srv://user:pass@cluster.mongodb.net/<dbName>?retryWrites=true&w=majority
  if (isAtlasSrvHost(server)) {
    return `mongodb+srv://${encodedUser}:${encodedPassword}@${server}/${dbName}?retryWrites=true&w=majority`;
  }

  // Case 3 — self-hosted with explicit host:port
  //   → mongodb://user:pass@host:port/<dbName>
  return `mongodb://${encodedUser}:${encodedPassword}@${server}/${dbName}`;
}

/**
 * Factory function consumed by MongooseModule.forRootAsync().
 * Keeps all DB configuration in one place and ensures that the
 * ConfigService is the single source of truth.
 */
export const mongooseConfig = (
  configService: ConfigService<EnvironmentVariables, true>,
): MongooseModuleOptions => {
  const user = configService.get('DB_USER', { infer: true });
  const password = configService.get('DB_PASSWORD', { infer: true });
  const server = configService.get('DB_SERVER', { infer: true });
  const dbName = configService.get('DB_NAME', { infer: true });

  const uri = buildMongoUri(user, password, server, dbName);

  return {
    uri,
    dbName,

    // ── Production-grade connection settings ─────────────────────────────
    serverSelectionTimeoutMS: 5_000,  // fail-fast if no server reachable
    socketTimeoutMS: 45_000,
    connectTimeoutMS: 10_000,

    // Retry logic — let the driver handle transient network blips
    retryWrites: true,
    retryReads: true,
  };
};
