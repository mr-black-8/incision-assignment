import { ApiProperty } from '@nestjs/swagger';
export class CreateItemDto {
  @ApiProperty()
  title: string;
  
  @ApiProperty()
  description: string;
  
  @ApiProperty()
  catagory?: string;
  
  @ApiProperty()
  tags?: string[];
}
