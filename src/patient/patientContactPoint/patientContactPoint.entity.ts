import { BaseEntityWithId } from 'src/abstract';
import { ContactPoint } from 'src/contactPoint/contactPoint.entity';
import { IPatientContactPoint } from 'src/types';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Patient } from '../patient.entity';

@Entity()
export class PatientContactPoint
  extends BaseEntityWithId
  implements IPatientContactPoint
{
  @ManyToOne(() => Patient, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: string;

  @ManyToOne(() => ContactPoint, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  contactPoint: string;
}
