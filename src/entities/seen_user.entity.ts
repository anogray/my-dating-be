import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index(['userId', 'seenUserId'], { unique: true })
export class SeenUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.seenUsers)
  user: User;
  
  @Column()
  userId: string;

  @Column()
  seenUserId: string;

  @Column({nullable:true})
  status: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}
