import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import CatalogDDBClient from '../aws-clients/dynamodb-client';
import { Status } from 'src/aws-clients/types';

const calcQualityScore = (item: CreateItemDto, titleExists: boolean): number => {
  let score = 40;
  const { title, description, catagory, tags } = item;
  if (title.length > 11 && title.length < 51) score += 20;
  if (description.length > 59) score += 15;
  if (tags && tags.length > 0) score += 10;
  if (tags && tags.length > 3) score += 10;
  if (catagory) score += 10;
  if (!titleExists) score += 5;
  return score;
};

@Injectable()
export class ItemsService {
  async create(createItemDto: CreateItemDto) {
    const catalogDDBClient = new CatalogDDBClient();

    const titleExists = await catalogDDBClient.checkTitleExists(createItemDto.title);
    const qualityScore = calcQualityScore(createItemDto, titleExists);
    const item = await catalogDDBClient.createItem({
      title: createItemDto.title,
      description: createItemDto.description,
      status: qualityScore > 69 ? Status.PENDING : Status.REJECTED,
      catagory: createItemDto.catagory,
      tags: createItemDto.tags,
      quality_score: qualityScore,
      created_by: 'system',
    });

    return item;
  }

  async findAll(status: Status) {
    const catalogDDBClient = new CatalogDDBClient();
    const items = await catalogDDBClient.getItems(status);
    return items;
  }

  // async findOne(id: number) {
  //   return `This action returns a #${id} item`;
  // }

  async update(id: string, updateItemDto: UpdateItemDto) {
    const catalogDDBClient = new CatalogDDBClient();
    const item = await catalogDDBClient.updateItem({
      id,
      status: updateItemDto.status,
      approved_by: 'system',
    });
    return item;
  }

  // async remove(id: number) {
  //   return `This action removes a #${id} item`;
  // }
}
