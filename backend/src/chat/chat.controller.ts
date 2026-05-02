import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  askQuestion(@Body() body: any) {
    // 1. Récupérer le dernier message tapé par l'utilisateur depuis l'historique
    const messages = body?.messages || [];
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    
    // 2. Obtenir la réponse depuis la base de connaissances de Nexus
    const response = this.chatService.getAutoResponse(lastUserMessage);
    
    // 3. Ajouter le tag secret si Nexus détecte un besoin d'escalade vers un humain
    let finalReply = response.reply;
    if (response.requiresSupport) {
      finalReply += ' [[PROPOSE_ESCALADE]]';
    }

    // 4. Retourner le format "LLM" attendu par le composant CynaChatbot
    return {
      content: [{ type: 'text', text: finalReply }]
    };
  }
}