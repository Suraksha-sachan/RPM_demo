import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { PatientAsset } from 'src/patient/patientAssets/patientAssets.entity';

import { IAsset } from 'src/types';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity()
export class Asset extends BaseEntityWithId implements IAsset {
  @ApiProperty({ description: 'type of asset' })
  @Column({ type: 'varchar', length: 50, default: 'image' })
  type: IAsset['type'];
  @ApiProperty({ description: 's3 path' })
  @Column({ type: 'varchar', length: 150, nullable: true, default: null })
  path: IAsset['path'] | null;
  @ApiProperty({ description: 's3 location' })
  @Column({ type: 'varchar', length: 150, nullable: true, default: null })
  location: IAsset['location'] | null;
  @ApiProperty({ description: 's3 etag' })
  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  eTag: IAsset['eTag'] | null;

  @OneToOne(
    () => PatientAsset,
    (i) => {
      return i.asset;
    },
    {
      nullable: true,
    },
  )
  patientAssets: string;
}
