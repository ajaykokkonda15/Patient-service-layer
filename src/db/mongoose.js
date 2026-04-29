'use strict';

const mongoose = require('mongoose');
const config = require('../config');

/**
 * Atlas hostnames have no explicit port and are not localhost.
 * e.g.  cluster0.hawlfvs.mongodb.net  → SRV
 *       localhost:27017               → plain TCP
 */
function isAtlasSrvHost(server) {
  const hasPort = /:\d+$/.test(server);
  const isLocal = server.startsWith('localhost') || server.startsWith('127.');
  return !hasPort && !isLocal;
}

/**
 * Builds the correct MongoDB connection URI from env variables.
 */
function buildMongoUri(user, password, server, dbName) {
  const u = encodeURIComponent(user);
  const p = encodeURIComponent(password);

  if (server.startsWith('mongodb://') || server.startsWith('mongodb+srv://')) {
    return server.replace(/^(mongodb(?:\+srv)?:\/\/)/, `$1${u}:${p}@`);
  }

  if (isAtlasSrvHost(server)) {
    return `mongodb+srv://${u}:${p}@${server}/${dbName}?retryWrites=true&w=majority`;
  }

  return `mongodb://${u}:${p}@${server}/${dbName}`;
}

async function connectDB() {
  const { user, password, server, name } = config.db;
  const uri = buildMongoUri(user, password, server, name);

  await mongoose.connect(uri, {
    dbName: name,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
  });

  console.log(`[MongoDB] Connected to "${name}"`);
}

module.exports = { connectDB };
