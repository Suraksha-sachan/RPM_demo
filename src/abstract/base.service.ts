import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IErrorObject } from 'src/types/IErrorObject';
import * as url from 'url';
import { DecodedUser, ROLES } from 'src/types';
import { getRootRoleAccessLevel } from 'src/utils/common';
import { SelectQueryBuilder } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
  PaginationTypeEnum,
} from 'nestjs-typeorm-paginate';

interface ICheckDecodedUser {
  requiredRole: ROLES;
  message?: string;
  user: DecodedUser | null;
}

export abstract class BaseService {
  protected _getBadRequestError(message: string) {
    throw new BadRequestException({ message });
  }
  protected _getForbiddenError(message: IErrorObject | string) {
    throw new ForbiddenException({ message });
  }
  protected _getInternalServerError(message: string) {
    throw new InternalServerErrorException({ message });
  }
  protected _getNotFoundError(message: string) {
    throw new NotFoundException({ message });
  }
  protected _getUnauthorizedError(message: string) {
    throw new UnauthorizedException({ message });
  }
  protected async _removeFile(filePath: string) {
    const path = this._buildAWSKeyFromFilePath(filePath);

  }
  protected _buildAwsFileName(fileName: string, originalName: string) {
    return fileName + '/' + originalName.replace(/\s/g, '-');
  }
  private _buildAWSKeyFromFilePath(path: string) {
    if (!path) {
      return '';
    }
    return url.parse(path).path.replace(/^\/|\/$/g, '');
  }
  public buildSortParams<T extends object>(param: string) {
    if (typeof param === 'string') {
      const result = param?.match(/^-/);
      if (result) {
        const key = param.slice(1);
        return [key, 'DESC'] as [keyof T, 'DESC'];
      }
    }
    return [param, 'ASC'] as [keyof T, 'ASC'];
  }
  public checkRoleOnPermission({
    role,
    requiredRole,
  }: {
    role?: ROLES;
    requiredRole: ROLES;
  }) {
    if (!role) {
      return false;
    }

    const requiredAccessLevel = getRootRoleAccessLevel([requiredRole]);
    const currentAccessLevel = getRootRoleAccessLevel([role]);
    return requiredAccessLevel <= currentAccessLevel;
  }

  protected async _paginate<T>(
    queryBuilder: SelectQueryBuilder<any>,
    { limit = 10, page = 1 }: IPaginationOptions,
  ): Promise<Pagination<T>> {
    const totalItems = await queryBuilder.getCount();
    return await paginate<T>(queryBuilder, {
      limit,
      page,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      //https://github.com/nestjsx/nestjs-typeorm-paginate/issues/627
      metaTransformer: ({ currentPage, itemCount, itemsPerPage }) => {
        // Calculating the total of pages
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        return {
          currentPage,
          itemCount,
          itemsPerPage,

          // Returning in this two row
          totalItems,
          totalPages: totalPages === 0 ? 1 : totalPages,
        };
      },
    });
  }
  
  protected checkDecodedUserOnPermission(
    prop: ICheckDecodedUser,
  ): DecodedUser | void {
    if (
      !this.checkRoleOnPermission({
        role: prop.user?.role,
        requiredRole: prop.requiredRole,
      })
    ) {
      return this._getUnauthorizedError(
        prop.message || "You don't have enough permissions",
      );
    }
    return prop.user;
  }
}
