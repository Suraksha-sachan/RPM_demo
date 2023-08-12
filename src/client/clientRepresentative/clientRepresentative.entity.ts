import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { HumanName } from 'src/humanName/humanName.entity';
import { IClientRepresentative } from 'src/types';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Client } from '../client.entity';
import { ClientRepresentativeContactPoint } from '../clientRepresentativeContactPoint/clientRepresentativeContactPoint.entity';

@Entity()
export class ClientRepresentative
  extends BaseEntityWithId
  implements IClientRepresentative
{
  @ApiProperty({ description: 'Client' }) //TODO - CHANGE TO RELATION
  @ManyToOne(() => Client, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  client: string;

  @ApiProperty({ description: 'Human name' }) //TODO - CHANGE TO RELATION
  @OneToOne(() => HumanName, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  humanName: string;

  @OneToMany(
    () => ClientRepresentativeContactPoint,
    (clientRepresentativeContactPoint) =>
      clientRepresentativeContactPoint.clientRepresentative,
    {
      nullable: true,
    },
  )
  @JoinColumn()
  clientRepresentativeContactPoints: string[];

  @ApiProperty({ description: 'position' }) //TODO - CHANGE TO RELATION
  @Index()
  @Column({ type: 'varchar', length: 100, default: null })
  position: string | null;
}
