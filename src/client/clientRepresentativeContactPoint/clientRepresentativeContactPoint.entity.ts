import { BaseEntityWithId } from 'src/abstract';
import { ContactPoint } from 'src/contactPoint/contactPoint.entity';
import { IClientRepresentativeContactPoint, IContactPoint } from 'src/types';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ClientRepresentative } from '../clientRepresentative/clientRepresentative.entity';

@Entity()
export class ClientRepresentativeContactPoint
  extends BaseEntityWithId
  implements IClientRepresentativeContactPoint
{
  @ManyToOne(() => ClientRepresentative, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  clientRepresentative: string;

  @ManyToOne(() => ContactPoint, {
    nullable: true,
  })
  @JoinColumn()
  contactPoint: IContactPoint | string;
}
