import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, CreateDateColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('messages')
export class Message  {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  senderId: string;

//   @ManyToOne(() => User, (user) => user.sentMessages)
//   @JoinColumn({ name: 'senderId' })
//   sender: User;

  @Column({ nullable: false })
  recipientId: string;

//   @ManyToOne(() => User, (user) => user.receivedMessages)
//   @JoinColumn({ name: 'recipientId' })
//   recipient: User;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

}
