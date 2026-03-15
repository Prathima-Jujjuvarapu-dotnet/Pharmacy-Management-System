import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  isOpen = false;
  userMessage = '';
  isTyping = false;

  chatHistory: { user: string; bot: string }[] = [];

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendQuickMessage(message: string) {
    this.userMessage = message;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    const message = this.userMessage;
    this.chatHistory.push({ user: message, bot: '' });
    this.userMessage = '';
    this.isTyping = true;

    setTimeout(() => {
      this.http.post<any>('http://localhost:5127/Chat', { message }).subscribe({
        next: (res) => {
          this.chatHistory[this.chatHistory.length - 1].bot = res.reply;
          this.isTyping = false;
        },
        error: () => {
          this.chatHistory[this.chatHistory.length - 1].bot = '⚠️ Error contacting chatbot.';
          this.isTyping = false;
        }
      });
    }, 800);
  }
}
