import { BaseEntityWithId } from 'src/abstract';
import { Asset } from 'src/assets/assets.entity';
import { IPatientAsset } from 'src/types';
import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Patient } from '../patient.entity';

@Entity()
export class PatientAsset extends BaseEntityWithId implements IPatientAsset {
  @ManyToOne(() => Patient, {
    nullable: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  patient: string;

  @OneToOne(() => Asset, {
    nullable: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  asset: string;
}
