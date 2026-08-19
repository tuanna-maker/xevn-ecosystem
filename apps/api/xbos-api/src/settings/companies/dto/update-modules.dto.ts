/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import { IsArray, IsEnum } from 'class-validator';
import { ALLOWED_MODULES } from './create-company.dto';
import type { AllowedModule } from './create-company.dto';

export class UpdateModulesDto {
  @IsArray()
  @IsEnum(ALLOWED_MODULES, { each: true })
  modules!: AllowedModule[];
}
