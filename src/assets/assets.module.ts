import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset } from './assets.entity';
import { AssetsService } from './assets.service';

@Module({
  providers: [AssetsService],
  exports: [AssetsService],
  imports: [TypeOrmModule.forFeature([Asset])],
  controllers: [],
})
export class AssetModule {}
