import { Global, Module } from '@nestjs/common';
import { XbosDbService } from './xbos-db.service';

@Global()
@Module({
  providers: [XbosDbService],
  exports: [XbosDbService],
})
export class XbosDbModule {}
