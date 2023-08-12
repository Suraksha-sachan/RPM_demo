import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { Patient } from 'src/patient/patient.entity';
import { IJournalNote } from 'src/types';
import { VitalNote } from 'src/vitals/vitalNotes/vitalNotes.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity()
export class JournalNote extends BaseEntityWithId implements IJournalNote {
  @ApiProperty({ description: 'Journal note patient' })
  @ManyToOne(() => Patient, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: string;

  @ApiProperty({ description: 'Title' })
  @Column({ type: 'varchar', length: 100, default: null })
  title: string;

  @ApiProperty({ description: 'Detail' })
  @Column({ type: 'varchar', length: 1000, default: null })
  details: string;

  @ApiProperty({ description: 'Vital Note' })
  @OneToOne(() => VitalNote, (vitalNote) => vitalNote.journalNote, {
    nullable: true,
  })
  vitalNote: string;
}
