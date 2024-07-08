import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

export class PageDto<T> {
    @IsArray()
    @ApiProperty({ type: Object, description: "Data array", isArray: true, example: []})
    readonly data: T[];
  
    @IsNumber()
    @ApiProperty({ example: 1, type: Number, description: "Total count"})
    readonly count: number;
  
    constructor(data: T[], count: number) {
      this.data = data;
      this.count = count;
    }
}