/**
 * @CODE-MEMORY
 * Purpose:    NestJS module wiring for Input Data Hub (E3).
 * WorkItem:   HRM-POLICY-E3-01
 * Coded:      2026-08-22
 * must_keep:  InputService exported — used by PayrollBatchModule
 * NOTE:       MulterModule.register({ storage: memoryStorage() }) keeps files in RAM.
 *             For large files, switch to disk storage or S3 presigned URL.
 */
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { InputController } from "./input.controller";
import { InputService } from "./input.service";

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [InputController],
  providers: [InputService],
  exports: [InputService], // PayrollBatchService dùng getApprovedRows
})
export class InputModule {}
