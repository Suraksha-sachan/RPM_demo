import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithId } from 'src/abstract';
import { JournalNote } from 'src/journalNotes/journalNotes.entity';
import { IVitalNote } from 'src/types';
import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { Vital } from '../vitals.entity';

@Entity()
export class VitalNote extends BaseEntityWithId implements IVitalNote {
  @ApiProperty({ description: 'Vital' })
  @OneToOne(() => Vital, (vital) => vital.vitalNote, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  vital: string;

  @ApiProperty({ description: 'Journal note' })
  @OneToOne(() => JournalNote, (journalNote) => journalNote.vitalNote, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  journalNote: string;
}
