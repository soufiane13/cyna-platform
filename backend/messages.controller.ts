import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() body: any) {
    return this.messagesService.createMessage(body);
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.messagesService.updateStatus(id, status);
  }

  @Post('send-email')
  sendEmail(@Body() body: { to: string | string[]; subject: string; message: string }) {
    return this.messagesService.sendEmail(body);
  }
}