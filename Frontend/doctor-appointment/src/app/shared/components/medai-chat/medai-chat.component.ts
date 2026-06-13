import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MedaiChatService } from './medai-chat.service';
import { MedAiMessage, MedAiQuickAction, ChatConversation, ChatMode } from './medai-chat.model';

@Component({
  selector: 'app-medai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './medai-chat.component.html',
  styleUrl: './medai-chat.component.scss'
})
export class MedaiChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('inputArea') inputArea!: ElementRef;

  mode: ChatMode = 'minimized';
  isClosing = false;
  isTyping = false;
  inputText = '';
  messages: MedAiMessage[] = [];
  conversations: ChatConversation[] = [];
  activeConversationId: string | null = null;
  unreadCount = 0;
  showSidebar = true;
  showNewMsgBtn = false;
  userScrolledUp = false;
  showDeleteConfirm = false;
  deleteTargetId: string | null = null;
  renamingId: string | null = null;
  renameText = '';
  loadingConversations = false;

  quickActions: MedAiQuickAction[] = [
    { label: 'I have fever', icon: 'thermostat', prompt: 'I have a fever. What should I do?' },
    { label: 'Headache remedies', icon: 'psychology', prompt: 'What are some remedies for a headache?' },
    { label: 'Cold symptoms', icon: 'ac_unit', prompt: 'I have cold symptoms. What should I do?' },
    { label: 'When to see a doctor?', icon: 'local_hospital', prompt: 'When should I see a doctor for common symptoms?' },
    { label: 'Book an appointment', icon: 'calendar_month', prompt: 'How can I book an appointment with a doctor on this platform?' },
  ];

  constructor(private chatService: MedaiChatService, private cdr: ChangeDetectorRef) {}

  get isLoggedIn(): boolean { return this.chatService.isLoggedIn; }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.loadConversations();
    }
  }

  ngOnDestroy(): void {}

  // ==================== MODE MANAGEMENT ====================

  openChat(): void {
    this.mode = 'expanded';
    if (this.messages.length === 0 && !this.activeConversationId) {
      this.addWelcomeMessage();
    }
    setTimeout(() => this.scrollToBottom(), 100);
  }

  closeChat(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.mode = 'minimized';
      this.isClosing = false;
      this.cdr.detectChanges();
    }, 250);
  }

  goFullscreen(): void {
    this.mode = 'fullscreen';
    if (this.messages.length === 0 && !this.activeConversationId) {
      this.addWelcomeMessage();
    }
    setTimeout(() => this.scrollToBottom(), 100);
  }

  exitFullscreen(): void {
    this.mode = 'expanded';
  }

  @HostListener('document:keydown.escape')
  onEscKey(): void {
    if (this.mode === 'fullscreen') this.exitFullscreen();
  }

  // ==================== CONVERSATION MANAGEMENT ====================

  loadConversations(): void {
    if (!this.isLoggedIn) return;
    this.loadingConversations = true;
    this.chatService.getConversations().subscribe({
      next: (res) => {
        this.conversations = res.data || [];
        this.loadingConversations = false;
        // Auto-load last conversation if we have one
        if (this.conversations.length > 0 && !this.activeConversationId) {
          this.selectConversation(this.conversations[0]);
        }
        this.cdr.detectChanges();
      },
      error: () => { this.loadingConversations = false; }
    });
  }

  selectConversation(conv: ChatConversation): void {
    if (this.activeConversationId === conv.id) return;
    this.activeConversationId = conv.id;
    this.messages = [];
    this.isTyping = false;

    this.chatService.getConversation(conv.id).subscribe({
      next: (res) => {
        this.messages = (res.data.messages || []).map((m: any) => ({
          id: m.id,
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.message,
          timestamp: new Date(m.createdAt),
          isEmergency: m.isEmergency
        }));
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  newConversation(): void {
    if (!this.isLoggedIn) {
      // Guest: just clear messages
      this.messages = [];
      this.activeConversationId = null;
      this.addWelcomeMessage();
      this.cdr.detectChanges();
      return;
    }

    this.chatService.createConversation().subscribe({
      next: (res) => {
        const newConv: ChatConversation = {
          id: res.data.id,
          title: res.data.title,
          createdAt: new Date(res.data.createdAt),
          updatedAt: new Date(res.data.createdAt)
        };
        this.conversations.unshift(newConv);
        this.activeConversationId = newConv.id;
        this.messages = [];
        this.addWelcomeMessage();
        this.cdr.detectChanges();
      }
    });
  }

  startRename(conv: ChatConversation, event: Event): void {
    event.stopPropagation();
    this.renamingId = conv.id;
    this.renameText = conv.title;
  }

  confirmRename(conv: ChatConversation): void {
    if (!this.renameText.trim()) return;
    this.chatService.renameConversation(conv.id, this.renameText.trim()).subscribe({
      next: () => {
        conv.title = this.renameText.trim();
        this.renamingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  cancelRename(): void {
    this.renamingId = null;
  }

  confirmDelete(convId: string, event: Event): void {
    event.stopPropagation();
    this.showDeleteConfirm = true;
    this.deleteTargetId = convId;
  }

  executeDelete(): void {
    if (!this.deleteTargetId) return;
    this.chatService.deleteConversation(this.deleteTargetId).subscribe({
      next: () => {
        this.conversations = this.conversations.filter(c => c.id !== this.deleteTargetId);
        if (this.activeConversationId === this.deleteTargetId) {
          this.activeConversationId = null;
          this.messages = [];
          if (this.conversations.length > 0) {
            this.selectConversation(this.conversations[0]);
          } else {
            this.addWelcomeMessage();
          }
        }
        this.showDeleteConfirm = false;
        this.deleteTargetId = null;
        this.cdr.detectChanges();
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
  }

  // ==================== MESSAGING ====================

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text || this.isTyping) return;

    const userMsg: MedAiMessage = {
      id: this.generateId(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    this.inputText = '';
    this.isTyping = true;
    this.userScrolledUp = false;

    const loadingMsg: MedAiMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    this.messages.push(loadingMsg);
    this.scrollToBottom();
    this.cdr.detectChanges();

    if (this.isLoggedIn && this.activeConversationId) {
      // Authenticated: send via conversation endpoint (auto-persists)
      this.chatService.sendMessageInConversation(this.activeConversationId, text).subscribe({
        next: (res) => {
          this.messages = this.messages.filter(m => m.id !== loadingMsg.id);
          // Update user message ID from server
          userMsg.id = res.data.userMessage.id;
          const botMsg: MedAiMessage = {
            id: res.data.aiMessage.id,
            role: 'assistant',
            content: res.data.aiMessage.message,
            timestamp: new Date(res.data.aiMessage.createdAt),
            isEmergency: res.data.aiMessage.isEmergency
          };
          this.messages.push(botMsg);
          this.isTyping = false;
          // Update conversation title in sidebar
          const conv = this.conversations.find(c => c.id === this.activeConversationId);
          if (conv && res.data.conversationTitle !== conv.title) {
            conv.title = res.data.conversationTitle;
          }
          if (conv) {
            conv.updatedAt = new Date();
            conv.lastMessage = res.data.aiMessage.message;
          }
          this.scrollToNewMessage();
          this.cdr.detectChanges();
        },
        error: () => this.handleSendError(loadingMsg.id)
      });
    } else if (this.isLoggedIn && !this.activeConversationId) {
      // Authenticated but no conversation yet - create one first
      this.chatService.createConversation().subscribe({
        next: (res) => {
          const newConv: ChatConversation = {
            id: res.data.id,
            title: res.data.title,
            createdAt: new Date(res.data.createdAt),
            updatedAt: new Date(res.data.createdAt)
          };
          this.conversations.unshift(newConv);
          this.activeConversationId = newConv.id;

          this.chatService.sendMessageInConversation(newConv.id, text).subscribe({
            next: (msgRes) => {
              this.messages = this.messages.filter(m => m.id !== loadingMsg.id);
              userMsg.id = msgRes.data.userMessage.id;
              const botMsg: MedAiMessage = {
                id: msgRes.data.aiMessage.id,
                role: 'assistant',
                content: msgRes.data.aiMessage.message,
                timestamp: new Date(msgRes.data.aiMessage.createdAt),
                isEmergency: msgRes.data.aiMessage.isEmergency
              };
              this.messages.push(botMsg);
              this.isTyping = false;
              newConv.title = msgRes.data.conversationTitle;
              newConv.lastMessage = msgRes.data.aiMessage.message;
              this.scrollToNewMessage();
              this.cdr.detectChanges();
            },
            error: () => this.handleSendError(loadingMsg.id)
          });
        },
        error: () => this.handleSendError(loadingMsg.id)
      });
    } else {
      // Guest mode: use simple chat endpoint, no persistence
      const history = this.messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp.toISOString() }));

      this.chatService.sendGuestMessage(text, history).subscribe({
        next: (res) => {
          this.messages = this.messages.filter(m => m.id !== loadingMsg.id);
          const botMsg: MedAiMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: res.data.reply,
            timestamp: new Date(res.data.timestamp),
            isEmergency: res.data.isEmergency
          };
          this.messages.push(botMsg);
          this.isTyping = false;
          this.scrollToNewMessage();
          this.cdr.detectChanges();
        },
        error: () => this.handleSendError(loadingMsg.id)
      });
    }
  }

  private handleSendError(loadingMsgId: string): void {
    this.messages = this.messages.filter(m => m.id !== loadingMsgId);
    const errorMsg: MedAiMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date()
    };
    this.messages.push(errorMsg);
    this.isTyping = false;
    this.scrollToBottom();
    this.cdr.detectChanges();
  }

  sendQuickAction(action: MedAiQuickAction): void {
    this.inputText = action.prompt;
    this.sendMessage();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    if (this.isLoggedIn && this.activeConversationId) {
      this.showDeleteConfirm = true;
      this.deleteTargetId = this.activeConversationId;
    } else {
      this.messages = [];
      this.addWelcomeMessage();
      this.cdr.detectChanges();
    }
  }

  copyMessage(content: string): void {
    navigator.clipboard.writeText(content);
  }

  // ==================== SMART SCROLLING ====================

  onMessagesScroll(): void {
    if (!this.messagesContainer) return;
    const el = this.messagesContainer.nativeElement;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    this.userScrolledUp = !atBottom;
    this.showNewMsgBtn = this.userScrolledUp && this.messages.length > 3;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
      this.showNewMsgBtn = false;
      this.userScrolledUp = false;
    }, 50);
  }

  private scrollToNewMessage(): void {
    if (this.userScrolledUp) {
      this.showNewMsgBtn = true;
      return;
    }
    this.scrollToBottom();
  }

  scrollToLatest(): void {
    this.scrollToBottom();
  }

  // ==================== HELPERS ====================

  formatMessage(content: string): string {
    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');
    return html;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getConversationDate(conv: ChatConversation): string {
    const now = new Date();
    const d = new Date(conv.updatedAt || conv.createdAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This Week';
    return 'Older';
  }

  get groupedConversations(): { label: string; items: ChatConversation[] }[] {
    const groups: Record<string, ChatConversation[]> = {};
    for (const conv of this.conversations) {
      const label = this.getConversationDate(conv);
      if (!groups[label]) groups[label] = [];
      groups[label].push(conv);
    }
    const order = ['Today', 'Yesterday', 'This Week', 'Older'];
    return order.filter(l => groups[l]).map(l => ({ label: l, items: groups[l] }));
  }

  private addWelcomeMessage(): void {
    const welcome: MedAiMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: `👋 **Welcome to MedAI!**\n\nI'm your healthcare assistant. I can help you:\n\n- Understand symptoms & possible causes\n- Get basic precautions and health tips\n- Know when to consult a doctor\n- Navigate healthcare services on MedBook\n\n*Please note: I provide general health information only, not medical diagnoses or emergency care.*`,
      timestamp: new Date()
    };
    this.messages.push(welcome);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }
}
