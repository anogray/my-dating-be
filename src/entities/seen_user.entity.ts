import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index(['userId', 'seen_user_id'], { unique: true })
export class SeenUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.seenUsers)
  user: User;
  

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  userA: User;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seen_user_id' })
  seenUser: User;

  @Column({ name: 'seen_user_id' })
  seen_user_id: string;

  @Column({nullable:true})
  status: string;
  
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;
}