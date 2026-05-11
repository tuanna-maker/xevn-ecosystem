import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ContractsInsuranceController } from './contracts-insurance/contracts-insurance.controller';
import { ContractsInsuranceService } from './contracts-insurance/contracts-insurance.service';
import { HrmDbService } from './db/hrm-db.service';
import { OperationsController } from './operations/operations.controller';
import { OperationsService } from './operations/operations.service';
import { RecruitmentController } from './recruitment/recruitment.controller';
import { RecruitmentService } from './recruitment/recruitment.service';
import { SpreadsheetController } from './spreadsheet/spreadsheet.controller';
import { SettingsCatalogsController } from './settings-catalogs/settings-catalogs.controller';

describe('AppModule wiring', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HrmDbService)
      .useValue({
        query: jest.fn().mockResolvedValue({ rows: [] }),
        onModuleDestroy: jest.fn(),
      })
      .compile();
  });

  it('registers controllers for recruitment, contracts-insurance, and operations lanes', () => {
    expect(moduleRef.get(RecruitmentController)).toBeDefined();
    expect(moduleRef.get(ContractsInsuranceController)).toBeDefined();
    expect(moduleRef.get(OperationsController)).toBeDefined();
  });

  it('registers providers for recruitment, contracts-insurance, and operations lanes', () => {
    expect(moduleRef.get(RecruitmentService)).toBeDefined();
    expect(moduleRef.get(ContractsInsuranceService)).toBeDefined();
    expect(moduleRef.get(OperationsService)).toBeDefined();
  });

  it('registers spreadsheet M2 spike controller', () => {
    expect(moduleRef.get(SpreadsheetController)).toBeDefined();
  });

  it('registers settings-catalogs controller', () => {
    expect(moduleRef.get(SettingsCatalogsController)).toBeDefined();
  });
});
