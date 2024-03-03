import {
  DatingGoal,
  EducationLevel,
  Gender,
  Interests,
  Languages,
} from 'src/common/enums/user.enum';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, NumericType } from 'typeorm';
import { SeenUser } from './seen_user.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ unique: true })
  // username: string;

  @Column({ unique: true })
  email: string;

  @Column({select:false})
  password: string;

  @OneToMany(() => SeenUser, (seenUser) => seenUser.user)
  seenUsers: SeenUser[];

  @Column({nullable:true})
  yob: number;

  @Column({ nullable: true })
  age: number;

  @Column({ type: 'enum', enum: Gender, nullable:true })
  gender: Gender;

  @Column({nullable:true})
  location: string;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture: string;

  @Column('varchar', { array: true , default:[]})
  images: string[];

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', nullable: true })
  education_level: string;

  @Column({ type: 'varchar', nullable: true })
  dating_goal: string;

  @Column('text', { array: true, default:[] })
  interests: string[];

  @Column('text', { array: true, default:[] })
  languages: string[];

  @Column({ nullable: true })
  height: number; // Assuming height is stored in centimeters

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;
}
