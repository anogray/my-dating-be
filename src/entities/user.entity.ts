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

    @Column()
    gender: string;

    @Column()
    location: string;

    @Column({ name: 'profile_picture', nullable: true })
    profilePicture: string;

    @Column({ type: 'text', nullable: true })
    bio: string;
}
