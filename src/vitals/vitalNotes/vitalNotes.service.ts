import { Inject } from '@nestjs/common';

import { BaseService } from 'src/abstract';

import { IFullVital, ROLES } from 'src/types';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { JournalNotesService } from 'src/journalNotes/journalNotes.service';

import { VitalNote } from './vitalNotes.entity';
import { VitalNoteDto } from './vitalNotes.dto';
import { VitalsService } from '../vitals.service';
import { IExpandRequestObject } from 'src/types/common';

export class VitalNotesService extends BaseService {
  constructor(
    @InjectRepository(VitalNote)
    private readonly vitalNoteRepository: Repository<VitalNote>,
    @Inject(VitalsService)
    private readonly vitalsService: VitalsService,
    @Inject(JournalNotesService)
    private readonly journalNotesService: JournalNotesService,
  ) {
    super();
  }

  async findVitalNote(id: string) {
    try {
      const foundVital = (await this.vitalNoteRepository.findOne({
        where: { id },
        relations: ['vital', 'journalNote'],
      })) as unknown as IFullVital;

      return foundVital;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
    //
  }

  async createVitalNote(data: VitalNoteDto, request: IExpandRequestObject) {
    try {
      const vital = await this.vitalsService.findVital(data.vital, request);
      if (!vital) {
        return this._getBadRequestError("Vital doesn't exists");
      }
      // if this is't owner
      this.checkDecodedUserOnPermission({
        // must be ma at least
        requiredRole: ROLES.MA,
        user: request.user,
      });
      //if this is ma he has to have the same client
      if (
        //if this is not super admin
        !this.checkRoleOnPermission({
          requiredRole: ROLES.SUPER_ADMIN,
          role: request.user.role,
        }) && // and has different client
        request?.user?.client.id !== vital.patient.client.id
      ) {
        this._getForbiddenError("You don't allow to get vital");
      }

      const journalNote = await this.journalNotesService.findJournalNote(
        data.journalNote,
      );
      if (!journalNote) {
        return this._getBadRequestError("Journal note doesn't exists");
      }

      const created = this.vitalNoteRepository.create(data);
      const saved = await this.vitalNoteRepository.save(created);
      await this.vitalsService.updateVital(
        saved.vital,
        {
          isCleared: true,
          patient: vital.patient.id,
          deviceType: vital.deviceType,
        },
        request,
      );

      const newValues = await this.findVitalNote(saved.id);

      return newValues;
    } catch (error) {
      this._getBadRequestError(error.message);
    }
  }
}
