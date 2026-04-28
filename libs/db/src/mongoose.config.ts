import { ConfigService } from "@nestjs/config";
import { MongooseModuleOptions } from "@nestjs/mongoose";

// ─── URI helpers ──────────────────────────────────────────────────────────────

/**
 * Atlas hostnames have no explicit port and are not localhost.
 * e.g.  cluster0.hawlfvs.mongodb.net  → SRV
 *       localhost:27017               → plain TCP
 */
function isAtlasSrvHost(server: string): boolean {
  const hasPort = /:\d+$/.test(server);
  const isLocal = server.startsWith("localhost") || server.startsWith("127.");
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
export function buildMongoUri(
  user: string,
  password: string,
  server: string,
  dbName: string,
): string {
  const u = encodeURIComponent(user);
  const p = encodeURIComponent(password);

  if (server.startsWith("mongodb://") || server.startsWith("mongodb+srv://")) {
    return server.replace(/^(mongodb(?:\+srv)?:\/\/)/, `$1${u}:${p}@`);
  }

  if (isAtlasSrvHost(server)) {
    return `mongodb+srv://${u}:${p}@${server}/${dbName}?retryWrites=true&w=majority`;
  }

  return `mongodb://${u}:${p}@${server}/${dbName}`;
}

// ─── Mongoose factory ─────────────────────────────────────────────────────────

/**
 * Factory consumed by MongooseModule.forRootAsync().
 * ConfigService is the single source of truth for all DB_* variables.
 */
export function mongooseConfigFactory(configService: ConfigService): MongooseModuleOptions {
  const user = configService.getOrThrow<string>("DB_USER");
  const password = configService.getOrThrow<string>("DB_PASSWORD");
  const server = configService.getOrThrow<string>("DB_SERVER");
  const dbName = configService.getOrThrow<string>("DB_NAME");

  const uri = buildMongoUri(user, password, server, dbName);

  return {
    uri,
    dbName,
    // ── Production-grade settings ─────────────────────────────────────────
    serverSelectionTimeoutMS: 5_000,  // fail-fast if no server reachable
    socketTimeoutMS: 45_000,
    connectTimeoutMS: 10_000,
    retryWrites: true,
    retryReads: true,
  };
}
