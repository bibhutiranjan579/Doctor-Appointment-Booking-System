import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatMessage, ChatContact } from '../../../core/models/models';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';
import { TopNavbarComponent } from '../top-navbar/top-navbar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, SidebarComponent, TopNavbarComponent],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" [theme]="theme" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Chat" [theme]="theme" [userName]="authService.currentUser?.name || ''" [userRole]="roleLabel" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          <div class="chat-layout">
            <!-- Left Panel: Contacts -->
            <div class="chat-sidebar">
              <div class="chat-sidebar__header">
                <mat-icon>chat</mat-icon>
                <h3>Messages</h3>
              </div>
              <div class="chat-sidebar__search">
                <div class="search-input-wrap">
                  <mat-icon>search</mat-icon>
                  <input type="text" placeholder="Search contacts..." [(ngModel)]="searchQuery">
                </div>
              </div>
              <div class="conversation-list">
                @if (loadingContacts) {
                  <div class="loading-contacts">
                    <mat-icon>hourglass_empty</mat-icon>
                    <p>Loading contacts...</p>
                  </div>
                } @else {
                  @for (contact of filteredContacts; track contact.userId) {
                    <div class="conversation-item" [class.active]="contact.userId === receiverId" [class.completed]="!contact.canChat" (click)="selectContact(contact)">
                      <div class="conv-avatar" [class.doctor-avatar]="contact.role === 'Doctor'" [class.completed-avatar]="!contact.canChat">{{ contact.name.charAt(0) }}</div>
                      <div class="conv-info">
                        <span class="conv-name">{{ contact.name }}</span>
                        <span class="conv-role">
                          @if (!contact.canChat) {
                            <mat-icon class="role-icon" style="color:#999;">check_circle</mat-icon>
                            Completed
                          } @else if (contact.role === 'Doctor') {
                            <mat-icon class="role-icon">medical_services</mat-icon>
                            {{ contact.specialization || contact.role }}
                          } @else {
                            <mat-icon class="role-icon">person</mat-icon>
                            {{ contact.specialization || contact.role }}
                          }
                        </span>
                        @if (lastMessages[contact.userId]) {
                          <span class="conv-preview">{{ lastMessages[contact.userId] }}</span>
                        }
                      </div>
                      @if (unreadCounts[contact.userId]) {
                        <span class="unread-badge">{{ unreadCounts[contact.userId] }}</span>
                      }
                    </div>
                  }
                  @if (filteredContacts.length === 0 && contacts.length > 0) {
                    <div class="no-conversations">
                      <mat-icon>search_off</mat-icon>
                      <p>No matching contacts</p>
                    </div>
                  }
                  @if (contacts.length === 0) {
                    <div class="no-conversations">
                      <mat-icon>forum</mat-icon>
                      <p>No contacts yet</p>
                      <span class="hint-text">Contacts appear here after your appointment is approved</span>
                    </div>
                  }
                }
              </div>
            </div>
            <!-- Right Panel: Chat Window -->
            <div class="chat-main">
              @if (receiverId) {
                <div class="chat-main__header">
                  <div class="chat-user">
                    <div class="chat-user-avatar" [class.doctor-avatar]="selectedContact?.role === 'Doctor'">{{ receiverName.charAt(0) }}</div>
                    <div>
                      <span class="chat-user-name">{{ receiverName }}</span>
                      <span class="chat-user-spec">{{ selectedContact?.specialization || selectedContact?.role }}</span>
                    </div>
                  </div>
                  <div class="chat-header-actions">
                    <button mat-icon-button title="Video call" aria-label="Start video call"><mat-icon>videocam</mat-icon></button>
                  </div>
                </div>
                <div class="messages-area" #messagesContainer>
                  @for (msg of messages; track msg.id) {
                    <div class="message-wrapper" [class.sent]="isSent(msg)" [class.received]="!isSent(msg)">
                      <div class="message-bubble">
                        @if (!isSent(msg)) {
                          <span class="message-sender">{{ msg.senderName || receiverName }}</span>
                        }
                        <p class="message-text">{{ msg.message }}</p>
                        <span class="message-time">{{ msg.timestamp | date:'shortTime' }}</span>
                      </div>
                    </div>
                  }
                  @if (messages.length === 0 && !loadingMessages) {
                    <div class="no-messages">
                      <mat-icon>chat_bubble_outline</mat-icon>
                      <p>No messages yet. Say hello!</p>
                    </div>
                  }
                </div>
                <div class="message-input-area">
                  @if (selectedContact && !selectedContact.canChat) {
                    <div class="chat-completed-notice">
                      <mat-icon>check_circle</mat-icon>
                      <span>Appointment completed. Book a new appointment to continue chatting.</span>
                    </div>
                  } @else {
                    <input type="text" class="message-input" placeholder="Type a message..." [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" [disabled]="sending">
                    <button mat-icon-button class="send-btn" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending">
                      <mat-icon>send</mat-icon>
                    </button>
                  }
                </div>
              } @else {
                <div class="chat-empty">
                  <mat-icon class="empty-icon">question_answer</mat-icon>
                  <h3>Select a conversation</h3>
                  <p>Choose a contact from your approved appointments to start chatting</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f0f2f5; }
    .dashboard-main { flex: 1; margin-left: 260px; }
    .dashboard-content { padding: 64px 0 0; height: calc(100vh - 64px); }
    .chat-layout { display: flex; height: calc(100vh - 64px); background: #f0f2f5; }
    .chat-sidebar { width: 360px; background: #fff; border-right: 1px solid #e0e0e0; display: flex; flex-direction: column; }
    .chat-sidebar__header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: #f8f9fc; border-bottom: 1px solid #e0e0e0; }
    .chat-sidebar__header mat-icon { color: #5b3a9e; font-size: 28px; width: 28px; height: 28px; }
    .chat-sidebar__header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1a1a2e; }
    .chat-sidebar__search { display: flex; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; }
    .search-input-wrap { flex: 1; display: flex; align-items: center; gap: 8px; background: #f0f2f5; border-radius: 20px; padding: 8px 16px; }
    .search-input-wrap mat-icon { color: #999; font-size: 20px; }
    .search-input-wrap input { border: none; outline: none; background: transparent; flex: 1; font-size: 14px; }
    .conversation-list { flex: 1; overflow-y: auto; }
    .conversation-item { display: flex; align-items: center; gap: 12px; padding: 14px 20px; cursor: pointer; transition: background 0.15s ease; border-bottom: 1px solid #f5f5f5; }
    .conversation-item:hover { background: #f8f9fc; }
    .conversation-item.active { background: #ede7f6; }
    .conv-avatar { width: 44px; height: 44px; border-radius: 50%; background: #5b3a9e; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
    .conv-avatar.doctor-avatar { background: #1b7a5a; }
    .conv-info { flex: 1; overflow: hidden; }
    .conv-name { display: block; font-weight: 600; font-size: 14px; color: #1a1a2e; }
    .conv-role { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #1b7a5a; font-weight: 600; }
    .role-icon { font-size: 12px; width: 12px; height: 12px; }
    .conv-preview { display: block; font-size: 12px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
    .unread-badge { background: #5b3a9e; color: #fff; border-radius: 50%; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .loading-contacts, .no-conversations { text-align: center; padding: 60px 20px; color: #aaa; }
    .loading-contacts mat-icon, .no-conversations mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px; }
    .hint-text { font-size: 12px; color: #bbb; display: block; margin-top: 4px; }
    .chat-main { flex: 1; display: flex; flex-direction: column; }
    .chat-main__header { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: #fff; border-bottom: 1px solid #e0e0e0; }
    .chat-user { display: flex; align-items: center; gap: 12px; }
    .chat-user-avatar { width: 40px; height: 40px; border-radius: 50%; background: #5b3a9e; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
    .chat-user-avatar.doctor-avatar { background: #1b7a5a; }
    .chat-user-name { display: block; font-weight: 600; font-size: 15px; color: #1a1a2e; }
    .chat-user-spec { display: block; font-size: 11px; color: #1b7a5a; font-weight: 600; }
    .chat-header-actions { display: flex; gap: 4px; color: #666; }
    .messages-area { flex: 1; overflow-y: auto; padding: 20px 24px; background: #e5ddd5; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5ccbb' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
    .message-wrapper { display: flex; margin-bottom: 8px; }
    .message-wrapper.sent { justify-content: flex-end; }
    .message-wrapper.received { justify-content: flex-start; }
    .message-bubble { max-width: 65%; padding: 8px 14px; border-radius: 12px; }
    .sent .message-bubble { background: #dcf8c6; border-bottom-right-radius: 4px; }
    .received .message-bubble { background: #fff; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
    .message-sender { display: block; font-size: 11px; font-weight: 600; color: #5b3a9e; margin-bottom: 2px; }
    .message-text { margin: 0; font-size: 14px; color: #333; line-height: 1.4; word-break: break-word; }
    .message-time { display: block; text-align: right; font-size: 10px; color: #999; margin-top: 4px; }
    .no-messages { text-align: center; padding: 80px 0; color: #aaa; }
    .no-messages mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .message-input-area { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fff; border-top: 1px solid #e0e0e0; }
    .message-input { flex: 1; border: none; outline: none; background: #f0f2f5; border-radius: 20px; padding: 10px 20px; font-size: 14px; }
    .send-btn { color: #5b3a9e; }
    .send-btn:disabled { color: #ccc; }
    .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #aaa; }
    .empty-icon { font-size: 80px; width: 80px; height: 80px; color: #ddd; margin-bottom: 16px; }
    .chat-empty h3 { margin: 0 0 8px; font-size: 20px; color: #666; }
    .chat-empty p { margin: 0; font-size: 14px; }
    .conversation-item.completed { opacity: 0.7; }
    .completed-avatar { background: #999 !important; }
    .chat-completed-notice { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #fff3e0; border-radius: 8px; color: #e65100; font-size: 13px; flex: 1; }
    .chat-completed-notice mat-icon { font-size: 18px; width: 18px; height: 18px; color: #e65100; flex-shrink: 0; }
    @media (max-width: 768px) { .chat-sidebar { width: 100%; } .chat-main { display: none; } }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  receiverId = '';
  receiverName = '';
  searchQuery = '';
  currentUserId: string;
  sending = false;
  loadingContacts = true;
  loadingMessages = false;

  contacts: ChatContact[] = [];
  selectedContact: ChatContact | null = null;
  lastMessages: Record<string, string> = {};
  unreadCounts: Record<string, number> = {};

  private subscription?: Subscription;
  private shouldScroll = false;

  theme: 'admin' | 'doctor' | 'patient' = 'patient';
  roleLabel = '';
  sidebarItems: SidebarItem[] = [];

  constructor(
    private chatService: ChatService,
    private signalrService: SignalrService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    const user = this.authService.currentUser;
    this.currentUserId = (user?.userId ?? '').toString().trim().toLowerCase();
    const role = this.authService.currentUser?.role || 'Patient';
    if (role === 'Doctor') {
      this.theme = 'doctor'; this.roleLabel = 'Doctor';
      this.sidebarItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/doctor/dashboard' },
        { label: 'Chat', icon: 'chat', route: '/doctor/chat' },
        { label: 'Video Call', icon: 'videocam', route: '/doctor/video-call' },
        { label: 'Profile', icon: 'person', route: '/doctor/profile' },
      ];
    } else {
      this.theme = 'patient'; this.roleLabel = 'Patient';
      this.sidebarItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/patient/dashboard' },
        { label: 'Find Doctors', icon: 'search', route: '/patient/search-doctors' },
        { label: 'Chat', icon: 'chat', route: '/patient/chat' },
        { label: 'Video Call', icon: 'videocam', route: '/patient/video-call' },
        { label: 'Profile', icon: 'person', route: '/patient/profile' },
      ];
    }
  }

  ngOnInit(): void {
    this.loadContacts();
    this.subscription = this.signalrService.messageReceived$.subscribe((msg: any) => {
      const normalized = this.normalizeMessage(msg);
      // Skip messages sent by current user (already added via HTTP response)
      if (normalized.senderId === this.currentUserId) return;

      if (normalized.senderId === this.receiverId) {
        this.messages.push(normalized);
        this.shouldScroll = true;
      }
      this.lastMessages[normalized.senderId] = normalized.message;
      if (normalized.senderId !== this.receiverId) {
        this.unreadCounts[normalized.senderId] = (this.unreadCounts[normalized.senderId] || 0) + 1;
      }
      this.cdr.detectChanges();
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  ngOnDestroy(): void { this.subscription?.unsubscribe(); }

  get filteredContacts(): ChatContact[] {
    if (!this.searchQuery.trim()) return this.contacts;
    const q = this.searchQuery.toLowerCase();
    return this.contacts.filter(c => c.name.toLowerCase().includes(q) || c.specialization.toLowerCase().includes(q) || c.role.toLowerCase().includes(q));
  }

  loadContacts(): void {
    this.loadingContacts = true;
    this.chatService.getContacts().subscribe({
      next: (res) => {
        if (res.success) {
          this.contacts = (res.data || []).map(c => ({ ...c, userId: (c.userId || '').toString().toLowerCase() }));
        }
        this.loadingContacts = false;
        this.cdr.detectChanges();
      },
      error: () => { this.contacts = []; this.loadingContacts = false; this.cdr.detectChanges(); }
    });
  }

  selectContact(contact: ChatContact): void {
    this.selectedContact = contact;
    this.receiverId = contact.userId.toLowerCase();
    this.receiverName = contact.name;
    this.unreadCounts[contact.userId] = 0;
    this.loadConversation();
  }

  loadConversation(): void {
    if (!this.receiverId) return;
    this.loadingMessages = true;
    this.chatService.getConversation(this.receiverId).subscribe({
      next: (res) => {
        if (res.success) {
          this.messages = (res.data || []).map((m: any) => this.normalizeMessage(m));
          this.shouldScroll = true;
        }
        this.loadingMessages = false;
        this.cdr.detectChanges();
      },
      error: () => { this.messages = []; this.loadingMessages = false; this.cdr.detectChanges(); }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.receiverId || this.sending) return;
    this.sending = true;
    const text = this.newMessage;
    this.newMessage = '';
    this.chatService.sendMessage(this.receiverId, text).subscribe({
      next: (res) => {
        if (res.success) {
          // Force senderId to currentUserId since WE sent this message
          const sent = this.normalizeMessage(res.data);
          sent.senderId = this.currentUserId;
          this.messages.push(sent);
          this.lastMessages[this.receiverId] = text;
          this.shouldScroll = true;
        }
        this.sending = false;
        this.cdr.detectChanges();
      },
      error: (err) => { this.newMessage = text; this.sending = false; this.snackBar.open(err.error?.message || 'Failed to send', 'Close', { duration: 3000 }); this.cdr.detectChanges(); }
    });
  }

  /** Normalize a message from HTTP or SignalR (handles both camelCase and PascalCase) */
  private normalizeMessage(m: any): ChatMessage {
    return {
      id: (m.id || m.Id || '').toString(),
      senderId: (m.senderId || m.SenderId || '').toString().trim().toLowerCase(),
      senderName: m.senderName || m.SenderName || '',
      receiverId: (m.receiverId || m.ReceiverId || '').toString().trim().toLowerCase(),
      receiverName: m.receiverName || m.ReceiverName || '',
      message: m.message || m.Message || '',
      timestamp: m.timestamp || m.Timestamp
    };
  }

  isSent(msg: ChatMessage): boolean {
    return msg.senderId === this.currentUserId;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) { this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight; }
  }
}
