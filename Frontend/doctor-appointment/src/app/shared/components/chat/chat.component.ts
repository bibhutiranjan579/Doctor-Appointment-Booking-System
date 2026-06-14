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
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, SidebarComponent, TopNavbarComponent, FooterComponent],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" [theme]="theme" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Chat" [theme]="theme" [userName]="authService.currentUser?.name || ''" [userRole]="roleLabel" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          <div class="chat-container">
            <div class="chat-layout" [class.show-chat]="!!receiverId" [class.show-contacts]="!receiverId">
              <!-- Left Panel: Contacts -->
              <div class="chat-sidebar">
                <div class="chat-sidebar__header">
                  <div class="header-left">
                    <div class="header-avatar">{{ authService.currentUser?.name?.charAt(0) || 'U' }}</div>
                  </div>
                  <div class="header-actions">
                    <button mat-icon-button><mat-icon>chat</mat-icon></button>
                    <button mat-icon-button><mat-icon>more_vert</mat-icon></button>
                  </div>
                </div>
                <div class="chat-sidebar__search">
                  <div class="search-input-wrap">
                    <mat-icon>search</mat-icon>
                    <input type="text" placeholder="Search or start new chat" [(ngModel)]="searchQuery">
                  </div>
                </div>
                <div class="conversation-list">
                  @if (loadingContacts) {
                    <div class="loading-contacts">
                      <div class="loading-spinner"></div>
                      <p>Loading chats...</p>
                    </div>
                  } @else {
                    @for (contact of filteredContacts; track contact.userId) {
                      <div class="conversation-item" [class.active]="contact.userId === receiverId" [class.completed]="!contact.canChat" (click)="selectContact(contact)">
                        <div class="conv-avatar" [class.doctor-avatar]="contact.role === 'Doctor'" [class.completed-avatar]="!contact.canChat">
                          {{ contact.name.charAt(0) }}
                          @if (contact.canChat) {
                            <span class="online-dot"></span>
                          }
                        </div>
                        <div class="conv-info">
                          <div class="conv-top-row">
                            <span class="conv-name">{{ contact.name }}</span>
                            <span class="conv-time">{{ lastMessages[contact.userId] ? 'now' : '' }}</span>
                          </div>
                          <div class="conv-bottom-row">
                            <span class="conv-preview">
                              @if (!contact.canChat) {
                                <mat-icon class="tick-icon">done_all</mat-icon> Appointment completed
                              } @else if (lastMessages[contact.userId]) {
                                <mat-icon class="tick-icon">done_all</mat-icon> {{ lastMessages[contact.userId] }}
                              } @else {
                                <mat-icon class="role-icon">{{ contact.role === 'Doctor' ? 'medical_services' : 'person' }}</mat-icon>
                                {{ contact.specialization || contact.role }}
                              }
                            </span>
                            @if (unreadCounts[contact.userId]) {
                              <span class="unread-badge">{{ unreadCounts[contact.userId] }}</span>
                            }
                          </div>
                        </div>
                      </div>
                    }
                    @if (filteredContacts.length === 0 && contacts.length > 0) {
                      <div class="no-conversations">
                        <mat-icon>search_off</mat-icon>
                        <p>No results found</p>
                      </div>
                    }
                    @if (contacts.length === 0) {
                      <div class="no-conversations">
                        <mat-icon>forum</mat-icon>
                        <p>No chats yet</p>
                        <span class="hint-text">Your conversations will appear here after appointment approval</span>
                      </div>
                    }
                  }
                </div>
              </div>
              <!-- Right Panel: Chat Window -->
              <div class="chat-main">
                @if (receiverId) {
                  <div class="chat-main__header">
                    <button mat-icon-button class="back-btn" (click)="goBack()"><mat-icon>arrow_back</mat-icon></button>
                    <div class="chat-user" (click)="goBack()">
                      <div class="chat-user-avatar" [class.doctor-avatar]="selectedContact?.role === 'Doctor'">
                        {{ receiverName.charAt(0) }}
                        <span class="online-dot-sm"></span>
                      </div>
                      <div>
                        <span class="chat-user-name">{{ receiverName }}</span>
                        <span class="chat-user-status">{{ selectedContact?.canChat ? 'online' : 'offline' }}</span>
                      </div>
                    </div>
                    <div class="chat-header-actions">
                      <button mat-icon-button title="Video call"><mat-icon>videocam</mat-icon></button>
                      <button mat-icon-button title="Voice call"><mat-icon>call</mat-icon></button>
                      <button mat-icon-button title="More"><mat-icon>more_vert</mat-icon></button>
                    </div>
                  </div>
                  <div class="messages-area" #messagesContainer>
                    <div class="encryption-notice">
                      <mat-icon>lock</mat-icon>
                      <span>Messages are private between you and your {{ selectedContact?.role === 'Doctor' ? 'doctor' : 'patient' }}</span>
                    </div>
                    @for (msg of messages; track msg.id) {
                      <div class="message-wrapper" [class.sent]="isSent(msg)" [class.received]="!isSent(msg)">
                        <div class="message-bubble">
                          <p class="message-text">{{ msg.message }}</p>
                          <div class="message-meta">
                            <span class="message-time">{{ msg.timestamp | date:'shortTime' }}</span>
                            @if (isSent(msg)) {
                              <mat-icon class="read-tick">done_all</mat-icon>
                            }
                          </div>
                          <div class="bubble-tail"></div>
                        </div>
                      </div>
                    }
                    @if (messages.length === 0 && !loadingMessages) {
                      <div class="no-messages">
                        <div class="no-msg-card">
                          <mat-icon>waving_hand</mat-icon>
                          <p>Say hello to start the conversation!</p>
                        </div>
                      </div>
                    }
                  </div>
                  <div class="message-input-area">
                    @if (selectedContact && !selectedContact.canChat) {
                      <div class="chat-completed-notice">
                        <mat-icon>info</mat-icon>
                        <span>Appointment completed. Book a new one to continue.</span>
                      </div>
                    } @else {
                      <input type="text" class="message-input" placeholder="Type a message" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" [disabled]="sending">
                      <button mat-icon-button class="send-btn" [class.active]="newMessage.trim()" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending">
                        <mat-icon>send</mat-icon>
                      </button>
                    }
                  </div>
                } @else {
                  <div class="chat-empty">
                    <div class="empty-illustration">
                      <mat-icon>laptop_mac</mat-icon>
                    </div>
                    <h3>MedBook Web</h3>
                    <p>Send and receive messages with your healthcare providers.<br>End-to-end private for your security.</p>
                    <div class="empty-features">
                      <div class="feature-item"><mat-icon>lock</mat-icon><span>Private messaging</span></div>
                      <div class="feature-item"><mat-icon>videocam</mat-icon><span>Video consultations</span></div>
                      <div class="feature-item"><mat-icon>schedule</mat-icon><span>Real-time updates</span></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #111b21; }
    .dashboard-main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; min-height: 100vh; }
    .dashboard-content { padding: 64px 0 0; flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    /* Chat Container */
    .chat-container { flex: 1; display: flex; flex-direction: column; min-height: 0; }
    .chat-layout { display: flex; flex: 1; min-height: 0; background: #eae6df; border-radius: 0; overflow: hidden; }

    /* ===== LEFT SIDEBAR ===== */
    .chat-sidebar { width: 380px; background: #fff; display: flex; flex-direction: column; min-height: 0; border-right: 1px solid #e9edef; }
    .chat-sidebar__header { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #008069; min-height: 56px; }
    .header-left { display: flex; align-items: center; }
    .header-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 15px; }
    .header-actions { display: flex; gap: 2px; }
    .header-actions button { color: rgba(255,255,255,0.85); }

    .chat-sidebar__search { padding: 8px 12px; background: #fff; }
    .search-input-wrap { display: flex; align-items: center; gap: 12px; background: #f0f2f5; border-radius: 8px; padding: 7px 14px; transition: background 0.2s; }
    .search-input-wrap:focus-within { background: #fff; box-shadow: 0 0 0 2px #00a884; }
    .search-input-wrap mat-icon { color: #54656f; font-size: 18px; width: 18px; height: 18px; }
    .search-input-wrap input { border: none; outline: none; background: transparent; flex: 1; font-size: 14px; color: #111b21; }
    .search-input-wrap input::placeholder { color: #8696a0; }

    .conversation-list { flex: 1; overflow-y: auto; }
    .conversation-list::-webkit-scrollbar { width: 6px; }
    .conversation-list::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

    .conversation-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #f0f2f5; }
    .conversation-item:hover { background: #f5f6f6; }
    .conversation-item.active { background: #f0f2f5; }
    .conversation-item.completed { opacity: 0.6; }

    .conv-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #00a884, #008069); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; position: relative; }
    .conv-avatar.doctor-avatar { background: linear-gradient(135deg, #5b3a9e, #7c4dff); }
    .conv-avatar.completed-avatar { background: #8696a0 !important; }
    .online-dot { position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; border-radius: 50%; background: #4caf50; border: 2px solid #fff; }

    .conv-info { flex: 1; overflow: hidden; }
    .conv-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
    .conv-name { font-weight: 500; font-size: 16px; color: #111b21; }
    .conv-time { font-size: 12px; color: #667781; }
    .conv-bottom-row { display: flex; justify-content: space-between; align-items: center; }
    .conv-preview { display: flex; align-items: center; gap: 3px; font-size: 13px; color: #667781; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
    .tick-icon { font-size: 16px; width: 16px; height: 16px; color: #53bdeb; }
    .role-icon { font-size: 14px; width: 14px; height: 14px; color: #667781; }
    .unread-badge { background: #25d366; color: #fff; border-radius: 50%; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }

    .loading-contacts { text-align: center; padding: 60px 20px; color: #8696a0; }
    .loading-spinner { width: 36px; height: 36px; border: 3px solid #e9edef; border-top-color: #00a884; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .no-conversations { text-align: center; padding: 60px 20px; color: #8696a0; }
    .no-conversations mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; color: #ccc; }
    .hint-text { font-size: 12px; color: #8696a0; display: block; margin-top: 4px; }

    /* ===== RIGHT CHAT PANEL ===== */
    .chat-main { flex: 1; display: flex; flex-direction: column; background: #efeae2; position: relative; }
    .chat-main::before { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cdefs%3E%3Cpattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23d1cdc7' fill-opacity='0.4'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23p)' width='300' height='300'/%3E%3C/svg%3E"); opacity: 0.6; pointer-events: none; z-index: 0; }

    .chat-main__header { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #008069; min-height: 56px; z-index: 1; position: relative; }
    .back-btn { color: #fff; display: none; }
    .chat-user { display: flex; align-items: center; gap: 10px; flex: 1; cursor: pointer; }
    .chat-user-avatar { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.2); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; position: relative; flex-shrink: 0; }
    .chat-user-avatar.doctor-avatar { background: rgba(124,77,255,0.3); }
    .online-dot-sm { position: absolute; bottom: 1px; right: 1px; width: 8px; height: 8px; border-radius: 50%; background: #4caf50; border: 2px solid #008069; }
    .chat-user-name { display: block; font-weight: 500; font-size: 15px; color: #fff; }
    .chat-user-status { display: block; font-size: 12px; color: rgba(255,255,255,0.7); }
    .chat-header-actions { display: flex; gap: 0; }
    .chat-header-actions button { color: rgba(255,255,255,0.85); }

    /* Messages */
    .messages-area { flex: 1; overflow-y: auto; padding: 20px 60px; z-index: 1; position: relative; }
    .messages-area::-webkit-scrollbar { width: 6px; }
    .messages-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }

    .encryption-notice { display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(255,234,163,0.9); border-radius: 8px; padding: 6px 14px; margin: 0 auto 16px; max-width: 420px; }
    .encryption-notice mat-icon { font-size: 14px; width: 14px; height: 14px; color: #8a6d3b; }
    .encryption-notice span { font-size: 12px; color: #54656f; text-align: center; }

    .message-wrapper { display: flex; margin-bottom: 3px; }
    .message-wrapper.sent { justify-content: flex-end; }
    .message-wrapper.received { justify-content: flex-start; }
    .message-bubble { max-width: 65%; padding: 6px 8px 4px; border-radius: 8px; position: relative; box-shadow: 0 1px 0.5px rgba(11,20,26,0.13); }
    .sent .message-bubble { background: #d9fdd3; border-top-right-radius: 0; }
    .received .message-bubble { background: #fff; border-top-left-radius: 0; }

    .message-text { margin: 0; font-size: 14.2px; color: #111b21; line-height: 1.35; word-break: break-word; padding-right: 48px; }
    .message-meta { display: flex; align-items: center; justify-content: flex-end; gap: 3px; margin-top: -10px; float: right; padding-left: 8px; }
    .message-time { font-size: 11px; color: #667781; }
    .read-tick { font-size: 16px; width: 16px; height: 16px; color: #53bdeb; }

    .no-messages { display: flex; align-items: center; justify-content: center; padding: 60px 0; }
    .no-msg-card { text-align: center; background: rgba(255,234,163,0.9); border-radius: 10px; padding: 12px 24px; }
    .no-msg-card mat-icon { font-size: 28px; width: 28px; height: 28px; color: #8a6d3b; }
    .no-msg-card p { margin: 4px 0 0; font-size: 13px; color: #54656f; }

    /* Input Area */
    .message-input-area { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f0f2f5; z-index: 1; position: relative; flex-shrink: 0; }
    .message-input { flex: 1; border: none; outline: none; background: #fff; border-radius: 8px; padding: 9px 16px; font-size: 15px; color: #111b21; box-shadow: 0 1px 1px rgba(0,0,0,0.06); min-width: 0; }
    .message-input::placeholder { color: #8696a0; }
    .send-btn { color: #8696a0; transition: color 0.2s; flex-shrink: 0; }
    .send-btn.active { color: #00a884; }
    .send-btn:disabled { color: #ccc; }

    .chat-completed-notice { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #ffeaa3; border-radius: 8px; color: #54656f; font-size: 13px; flex: 1; }
    .chat-completed-notice mat-icon { font-size: 18px; width: 18px; height: 18px; color: #8a6d3b; flex-shrink: 0; }

    /* Empty State */
    .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1; position: relative; background: #f0f2f5; border-bottom: 6px solid #25d366; }
    .empty-illustration { margin-bottom: 24px; }
    .empty-illustration mat-icon { font-size: 72px; width: 72px; height: 72px; color: #cfd8dc; }
    .chat-empty h3 { margin: 0 0 12px; font-size: 28px; font-weight: 300; color: #41525d; }
    .chat-empty p { margin: 0 0 24px; font-size: 14px; color: #667781; text-align: center; line-height: 1.5; }
    .empty-features { display: flex; gap: 24px; }
    .feature-item { display: flex; align-items: center; gap: 8px; color: #667781; font-size: 13px; }
    .feature-item mat-icon { font-size: 18px; width: 18px; height: 18px; color: #00a884; }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .dashboard-main { margin-left: 220px; }
      .chat-sidebar { width: 320px; }
      .messages-area { padding: 16px 30px; }
    }

    @media (max-width: 768px) {
      .dashboard-main { margin-left: 0; min-height: 100vh; }
      .dashboard-content { padding: 56px 0 0; }
      .chat-container { flex: 1; display: flex; flex-direction: column; }
      .chat-layout { height: calc(100vh - 56px); overflow: hidden; }

      /* Mobile: show contacts or chat, not both */
      .chat-sidebar { width: 100%; height: 100%; }
      .chat-main { width: 100%; height: 100%; }
      .chat-layout.show-chat .chat-sidebar { display: none; }
      .chat-layout.show-contacts .chat-main { display: none; }

      .back-btn { display: inline-flex !important; }
      .chat-main__header { padding: 8px 10px; min-height: 48px; }
      .chat-user-avatar { width: 34px; height: 34px; font-size: 14px; }
      .chat-user-name { font-size: 14px; }
      .messages-area { padding: 12px 14px; flex: 1; min-height: 0; }
      .message-bubble { max-width: 85%; }
      .message-text { font-size: 14px; padding-right: 44px; }
      .message-input-area { padding: 8px 10px; gap: 8px; position: sticky; bottom: 0; }
      .message-input { padding: 10px 14px; font-size: 15px; border-radius: 20px; }
      .send-btn { width: 40px; height: 40px; }
      .encryption-notice { max-width: 90%; }
      .chat-empty { display: none; }
      .empty-features { flex-direction: column; gap: 12px; }
      app-footer { display: none; }
    }
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

  goBack(): void {
    this.receiverId = '';
    this.receiverName = '';
    this.selectedContact = null;
    this.messages = [];
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