import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BucketListsService } from './bucket-lists.service';
import { CreateBucketListDto } from './dto/create-bucket-list.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import type { Request } from 'express';

@Controller('bucket-lists')
export class BucketListsController {
  constructor(private readonly bucketListsService: BucketListsService) {}

  @Post('')
  @UseGuards(AccessTokenGuard)
  async createBucketList(
    @Body() body: CreateBucketListDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.sub;

    return this.bucketListsService.create(userId, body);
  }

  @Get('')
  @UseGuards(AccessTokenGuard)
  async getBucketLists(@Req() req: Request) {
    const userId = req.user!.sub;

    return this.bucketListsService.find(userId);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  async getBucketListById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    console.log('req', req);
    const userId = req.user!.sub;

    return this.bucketListsService.findById(userId, id);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  async deleteBucketList(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user!.sub;

    return this.bucketListsService.remove(userId, id);
  }
}
