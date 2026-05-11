import { Module } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { SpreadsheetController } from './spreadsheet.controller';
import { SpreadsheetIngestService } from './spreadsheet-ingest.service';
import { SpreadsheetTemplateService } from './spreadsheet-template.service';
import { SpreadsheetService } from './spreadsheet.service';

@Module({
  imports: [EmployeesModule],
  controllers: [SpreadsheetController],
  providers: [SpreadsheetService, SpreadsheetIngestService, SpreadsheetTemplateService],
  exports: [SpreadsheetService, SpreadsheetIngestService],
})
export class SpreadsheetModule {}
