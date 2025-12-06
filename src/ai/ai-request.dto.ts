import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AiProvider {
  OLLAMA = 'ollama',
  GOOGLE = 'google',
}

export class ChatRequestDto {
  @ApiProperty({
    description: 'Message to send to the AI',
    example: 'Hello, how are you?',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'AI provider to use',
    enum: AiProvider,
    default: AiProvider.OLLAMA,
    required: false,
  })
  @IsEnum(AiProvider)
  @IsOptional()
  provider?: AiProvider = AiProvider.OLLAMA;

  @ApiProperty({
    description: 'Model name to use',
    example: 'llama3.2',
    required: false,
  })
  @IsString()
  @IsOptional()
  modelName?: string;
}