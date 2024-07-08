import { ApiProperty } from "@nestjs/swagger";

export class ExceptionResponseDto {
    @ApiProperty({
        example: ['Unexpected error'],
        type: [String],
        description: 'Error message',
        required: true
    })
    message!: string[];

    @ApiProperty({
        example: 'Error',
        type: String,
        description: 'Error name',
        required: true
    })
    error!: string;

    @ApiProperty({
        example: 500,
        type: Number,
        description: 'HTTP status code',
        required: true
    })
    status!: number;

    @ApiProperty({
        example: '2021-09-01T12:00:00.000Z',
        type: String,
        description: 'Date and time of the error',
        required: true
    })
    date!: string;
  
    constructor(message: string[], error: string, status: number) {
        this.message = message;
        this.error = error;
        this.status = status;
        this.date = new Date().toISOString();
    }
}