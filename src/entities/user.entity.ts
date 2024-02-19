import { DatingGoal, EducationLevel, Gender, Interests, Languages } from 'src/common/enums/user.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';



@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({type:"enum", enum:Gender})
  gender: Gender;

  @Column()
  location: string;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', nullable: true })
  education_level: string;
  
  @Column({ type: 'varchar', default:DatingGoal.STILL_FIGURING_OUT })
  dating_goal: string;
  
  @Column("text", {array: true})
  interests: string[];

  @Column("text", {array: true})
  languages: string[];

  @Column({ nullable: true })
  height: number; // Assuming height is stored in centimeters
}
