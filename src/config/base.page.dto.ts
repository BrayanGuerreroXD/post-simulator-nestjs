import { IsArray, IsNumber } from "class-validator";

export class PageDto<T> {
    @IsArray()
    readonly data: T[];
  
    @IsNumber()
    readonly count: number;
  
    constructor(data: T[], count: number) {
      this.data = data;
      this.count = count;
    }
}