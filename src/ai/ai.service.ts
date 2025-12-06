import { Injectable, BadRequestException } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { AiProvider } from './ai-request.dto';
import { ChatResponseDto } from './ai-response.dto';
import { IMAGE_ANALYSIS_PROMPT, AGE_ESTIMATION_PROMPT } from './ai.data';

@Injectable()
export class AiService {
  async chat(message: string, provider: AiProvider, modelName?: string) {
    
    const model = this.getModel(provider, modelName);

    const response = await model.invoke([
      new HumanMessage(message),
    ]);

    return Object.assign(new ChatResponseDto(), {
      provider,
      model: modelName || (provider === 'ollama' ? 'llama3' : 'gemini-1.5-flash'),
      responseContent: response.content as string,
    });
  }

  async analyzeImage(imageData: string, provider: AiProvider, modelName?: string, customPrompt?: string) {
    const model = this.getModel(provider, modelName);

    const response = await model.invoke([
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: customPrompt || IMAGE_ANALYSIS_PROMPT,
          },
          {
            type: 'image_url',
            image_url: imageData,
          },
        ],
      }),
    ]);

    return Object.assign(new ChatResponseDto(), {
      provider,
      model: modelName || (provider === 'ollama' ? 'llama3.2-vision' : 'gemini-1.5-flash'),
      responseContent: response.content as string,
    });
  }

  async estimateAge(imageData: string, provider: AiProvider, modelName?: string) {
    const model = this.getModel(provider, modelName);

    const response = await model.invoke([
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: AGE_ESTIMATION_PROMPT,
          },
          {
            type: 'image_url',
            image_url: imageData,
          },
        ],
      }),
    ]);

    return Object.assign(new ChatResponseDto(), {
      provider,
      model: modelName || (provider === 'ollama' ? 'llama3.2-vision' : 'gemini-1.5-flash'),
      responseContent: response.content as string,
    });
  }

  private getModel(provider: AiProvider, modelName?: string) {
    switch (provider) {
      case AiProvider.OLLAMA:
        return new ChatOllama({
          baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
          model: modelName || "llama3",
          temperature: 0.7,
        });

      case AiProvider.GOOGLE:
        return new ChatGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_API_KEY,
          model: modelName || "gemini-1.5-flash", // User choice OR default
          maxOutputTokens: 2048,
        });

      default:
        throw new BadRequestException('Invalid AI Provider');
    }
  }
}