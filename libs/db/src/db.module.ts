import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { mongooseConfigFactory } from "./mongoose.config.js";

/**
 * Global database module.
 *
 * Import once in AppModule to make the Mongoose connection available
 * application-wide. The connection is driven entirely by ConfigService
 * so that DB_* environment variables are the single source of truth.
 *
 * Supports both:
 *   - MongoDB Atlas (mongodb+srv://)  → set DB_SERVER=cluster.mongodb.net
 *   - Self-hosted                     → set DB_SERVER=localhost:27017
 */
@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: mongooseConfigFactory,
    }),
  ],
  exports: [MongooseModule],
})
export class DbModule {}
