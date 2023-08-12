import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { Address } from 'src/address/address.entity';
import { IClient } from 'src/types';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ClientRepresentative } from './clientRepresentative/clientRepresentative.entity';

@Entity()
export class Client
  extends BaseEntityWithId
  implements IClient<string, string>
{
  @ApiProperty({ description: 'id' })
  @PrimaryColumn({ unique: true })
  id: string;

  @ApiProperty({ description: 'title' }) //TODO - CHANGE TO RELATION
  @Index()
  @Column({ type: 'varchar', length: 100, default: null })
  title: string;

  @ApiProperty({ description: 'given' })
  @Column({ type: 'varchar', length: 100, default: null })
  @OneToMany(
    () => ClientRepresentative,
    (clientRepresentative) => clientRepresentative.client,
    {
      nullable: true,
    },
  )
  @JoinColumn()
  clientRepresentative: string[];
  @OneToOne(() => Address, {
    nullable: true,
  })
  @JoinColumn()
  address: string;

  @ApiProperty({ description: 'Is active flag' }) //TODO - CHANGE TO RELATION
  @Index()
  @Column({ type: 'boolean', default: true })
  active: boolean;
}
