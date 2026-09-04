/**
 * Purpose: Global module for HrmDbService — imported by AppModule, available everywhere.
 */
import { Global, Module } from "@nestjs/common";
import { HrmDbService } from "./hrm-db.service";

@Global()
@Module({
  providers: [HrmDbService],
  exports: [HrmDbService],
})
export class HrmDbModule {}
