import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

type ChatRequest = {
  prompt: string;
  context?: Record<string, unknown>;
};

@ApiTags('ai')
@Controller('ai')
export class AiController {
  @Post('hrm-chat')
  hrmChat(@Body() body: ChatRequest) {
    return {
      answerVi:
        'API HRM AI đã sẵn sàng nhận prompt qua backend. Provider LLM thật sẽ được cấu hình ở service layer.',
      echo: body.prompt,
    };
  }

  @Post('landing-chat')
  landingChat(@Body() body: ChatRequest) {
    return {
      answerVi:
        'API Landing AI đã thay thế điểm gọi Edge Function ở mức contract backend.',
      echo: body.prompt,
    };
  }

  @Post('tts')
  tts(@Body() body: ChatRequest) {
    return {
      status: 'accepted',
      messageVi: 'API TTS backend đã nhận yêu cầu. Provider âm thanh thật sẽ được nối ở service layer.',
      text: body.prompt,
    };
  }
}
