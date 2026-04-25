import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { GetEffectiveConfigQueryDto, UpsertOriginDto, UpsertVariantDto } from './dto';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post('origins')
  createOrigin(@Body() dto: UpsertOriginDto) {
    return this.configService.upsertOrigin(dto);
  }

  @Post('origins/:originCode/publish')
  publishOrigin(@Param('originCode') originCode: string) {
    return this.configService.publishOrigin(originCode);
  }

  @Post('variants')
  createVariant(@Body() dto: UpsertVariantDto) {
    return this.configService.upsertVariant(dto);
  }

  @Post('variants/:variantId/publish')
  publishVariant(@Param('variantId') variantId: string) {
    return this.configService.publishVariant(variantId);
  }

  @Get('effective')
  getEffectiveConfig(@Query() query: GetEffectiveConfigQueryDto) {
    return this.configService.getEffectiveConfig(query);
  }

}
