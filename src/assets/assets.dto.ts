import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { IAsset } from 'src/types';

export class AssetDto implements Partial<IAsset> {
  @IsString()
  @ApiProperty({ description: 'type' })
  type: IAsset['type'];
  @IsString()
  @ApiProperty({ description: 'path' })
  path: IAsset['path'];
}
