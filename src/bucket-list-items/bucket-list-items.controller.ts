import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BucketListItemsService } from './bucket-list-items.service';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { CreateBucketListItemDto } from './dto/create-bucket-list-item.dto';
import type { Request } from 'express';
import { UpdateBucketListItemDto } from './dto/update-bucket-list-item.dto';

@Controller('bucket-lists')
export class BucketListItemsController {
  constructor(
    private readonly bucketListItemsService: BucketListItemsService,
  ) {}

  @Post('/:bucketListId/items')
  @UseGuards(AccessTokenGuard)
  async createBucketListItem(
    @Req() req: Request,
    @Param('bucketListId', ParseIntPipe) bucketListId: number,
    @Body() createBucketListItemDto: CreateBucketListItemDto,
  ) {
    const userId = req.user!.sub;

    return this.bucketListItemsService.create(
      userId,
      bucketListId,
      createBucketListItemDto,
    );
  }

  // 모든 버킷리스트 아이템을 조회
  @Get('/:bucketListId/items')
  @UseGuards(AccessTokenGuard)
  async findAllBucketListItems(
    @Req() req: Request,
    @Param('bucketListId', ParseIntPipe) bucketListId: number,
  ) {
    const userId = req.user!.sub;
    return this.bucketListItemsService.findAll(userId, bucketListId);
  }

  @Patch('/:bucketListId/items/:itemId')
  @UseGuards(AccessTokenGuard)
  async updateBucketListItem(
    @Req() req: Request,
    @Param('bucketListId', ParseIntPipe) bucketListId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateBucketListItemDto: UpdateBucketListItemDto,
  ) {
    const userId = req.user!.sub;
    return this.bucketListItemsService.update(
      userId,
      bucketListId,
      itemId,
      updateBucketListItemDto,
    );
  }

  @Delete('/:bucketListId/items/:itemId')
  @UseGuards(AccessTokenGuard)
  async removeBucketListItem(
    @Req() req: Request,
    @Param('bucketListId', ParseIntPipe) bucketListId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    const userId = req.user!.sub;
    return this.bucketListItemsService.remove(userId, bucketListId, itemId);
  }
}
