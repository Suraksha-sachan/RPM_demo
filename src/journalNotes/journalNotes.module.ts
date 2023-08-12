import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';
import { PatientModule } from 'src/patient/patient.module';
import { JournalNotesController } from './journalNotes.controller';
import { JournalNote } from './journalNotes.entity';
import { JournalNotesService } from './journalNotes.service';

@Module({
  controllers: [JournalNotesController],
  providers: [JournalNotesService],
  exports: [JournalNotesService],
  imports: [
    PatientModule,
    AuditModule,
    TypeOrmModule.forFeature([JournalNote]),
  ],
})
export class JournalNotesModule {}
