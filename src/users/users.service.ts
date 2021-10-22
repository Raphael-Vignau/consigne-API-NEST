import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DeleteResult, Like, Repository, In } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { AddressEntity } from './entities/address.entity';
import { UserRole } from '../enums/user.role';
import { CollecteStatus } from '../enums/collecte.status';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>
    ) {
    }

    async findOneUserById(id: string): Promise<UserEntity> {
        return await this.userRepository.findOne({ id }, {relations: ['address', 'delivery_address']});
    }

    async findOneUserByEmail(email: string): Promise<UserEntity> {
        return await this.userRepository.findOne({ email }, {relations: ['address', 'delivery_address']});
    }

    async findUsers(
        contains: string,
        skip: number,
        take: number,
        order: any
    ): Promise<UserEntity[]> {
        return await this.userRepository.find({
            skip, take, order,
            relations: ['address', 'delivery_address'],
            where: {
                username: Like(`%${contains}%`)
            }
        });
    }

    async findUsersWaitingPassage(
        contains: string,
        skip: number,
        take: number,
        order: any
    ): Promise<UserEntity[]> {
        return await this.userRepository.find({
            skip, take, order,
            relations: ['address', 'delivery_address'],
            where: {
                collecte_point: true,
                collecte_status: In([CollecteStatus.FULL, CollecteStatus.ALMOST_FULL]),
                username: Like(`%${contains}%`)
            }
        });
    }

    async findAllForExport(): Promise<UserEntity[]> {
        return await this.userRepository.find({
            where: { role: UserRole.USER },
            relations: ['address', 'delivery_address']
        });
    }

    async createUser(user: CreateUserDto): Promise<UserEntity> {
        if (user.address) {
            await this.addressRepository.save(user.address)
        }
        if (user.delivery_address) {
            await this.addressRepository.save(user.delivery_address)
        }
        return this.userRepository.save(user)
    }

    async updateUser(id: string, user: UpdateUserDto): Promise<UserEntity> {

        // On récupére le user et on remplace les anciennes valeurs
        const targetUser = await this.userRepository.preload({
            id,
            ...user
        });
        // tester si le user avec cet id n'existe pas
        if (!targetUser) {
            throw new NotFoundException();
        }
        if (user.password) {
            targetUser.password = await AuthService.hashPassword(user.password);
        }
        if (targetUser.address) {
            await this.addressRepository.save(targetUser.address)
        }
        if (targetUser.delivery_address) {
            await this.addressRepository.save(targetUser.delivery_address)
        }
        return await this.userRepository.save(targetUser);
    }

    async deleteUser(id: string): Promise<DeleteResult> {
        return await this.userRepository.delete(id);
    }

    async countUsers(): Promise<Number> {
        return await this.userRepository.count();
    }

    async countUsersWaiting(): Promise<Number> {
        return await this.userRepository.count({
            where: {
                collecte_point: true,
                collecte_status: In([CollecteStatus.FULL, CollecteStatus.ALMOST_FULL]),
            }
        });
    }
}
