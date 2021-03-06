import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../enums/user.role';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../../users/dto/create-address.dto';

export class SignupUserDto {

    @IsNotEmpty()
    @IsString()
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    @IsOptional()
    @IsString()
    readonly company: string;

    @IsOptional()
    @Type(() => CreateAddressDto)
    readonly address!: CreateAddressDto;

    @IsOptional()
    @Type(() => CreateAddressDto)
    readonly delivery_address!: CreateAddressDto;

    @IsOptional()
    @IsString()
    readonly tel!: string;

    @IsNotEmpty()
    @IsEnum(UserRole)
    readonly role: UserRole;

    @IsOptional()
    @IsBoolean()
    readonly reseller!: boolean;

    @IsOptional()
    @IsBoolean()
    readonly producer!: boolean;

    @IsOptional()
    @IsString()
    readonly delivery_schedules!: string;

    @IsOptional()
    @IsString()
    readonly delivery_data!: string;

    @IsOptional()
    @IsBoolean()
    readonly heavy_truck!: boolean;

    @IsOptional()
    @IsBoolean()
    readonly stacker!: boolean;

    @IsOptional()
    @IsBoolean()
    readonly forklift!: boolean;

    @IsOptional()
    @IsBoolean()
    readonly pallet_truck!: boolean;

    @IsOptional()
    @IsString()
    readonly internal_data!: string;
}
