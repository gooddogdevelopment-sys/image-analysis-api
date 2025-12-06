import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatRequestDto } from './ai-request.dto';
import { ChatResponseDto } from './ai-response.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a chat message to AI' })
  @ApiResponse({ status: 200, type: ChatResponseDto })
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const provider = chatRequest.provider || 'ollama';

    return this.aiService.chat(
      chatRequest.message,
      provider as any,
      chatRequest.modelName,
    );
  }

  @Post('analyze-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload and analyze an image' })
  @ApiResponse({ status: 200, type: ChatResponseDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to analyze',
        },
        provider: {
          type: 'string',
          enum: ['ollama', 'google'],
          default: 'ollama',
          description: 'AI provider to use',
        },
        modelName: {
          type: 'string',
          example: 'llama3.2-vision',
          description: 'Model name to use',
        },
        customPrompt: {
          type: 'string',
          example: 'Describe this image in detail',
          description: 'Custom prompt for image analysis',
        },
      },
      required: ['image'],
    },
  })
  async analyzeImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('provider') provider?: string,
    @Body('modelName') modelName?: string,
    @Body('customPrompt') customPrompt?: string,
  ): Promise<ChatResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const aiProvider = (provider as any) || 'ollama';

    return this.aiService.analyzeImage(
      base64Image,
      aiProvider,
      modelName,
      customPrompt,
    );
  }

  @Post('estimate-age')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Estimate age of person in image' })
  @ApiResponse({ status: 200, type: ChatResponseDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file with person to estimate age',
        },
        provider: {
          type: 'string',
          enum: ['ollama', 'google'],
          default: 'ollama',
          description: 'AI provider to use',
        },
        modelName: {
          type: 'string',
          example: 'llama3.2-vision',
          description: 'Model name to use',
        },
      },
      required: ['image'],
    },
  })
  async estimateAge(
    @UploadedFile() file: Express.Multer.File,
    @Body('provider') provider?: string,
    @Body('modelName') modelName?: string,
  ): Promise<ChatResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const aiProvider = (provider as any) || 'ollama';

    return this.aiService.estimateAge(base64Image, aiProvider, modelName);
  }
}
