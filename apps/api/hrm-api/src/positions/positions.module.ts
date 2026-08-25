import { Module } from '@nestjs/common';
import { SettingsCatalogsModule } from '../settings-catalogs/settings-catalogs.module';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';

@Module({
  imports: [SettingsCatalogsModule],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}
