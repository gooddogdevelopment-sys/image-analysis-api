import { IsEnum, IsString } from "class-validator";
import { AiProvider } from "./ai-request.dto";

export class ChatResponseDto{

    @IsEnum(AiProvider)
    provider: AiProvider;

    @IsString()
    model: string;

    @IsString()
    responseContent: string;
}