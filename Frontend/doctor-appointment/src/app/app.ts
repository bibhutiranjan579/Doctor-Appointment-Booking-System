import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { SignalrService } from './core/services/signalr.service';
import { AuthService } from './core/services/auth.service';
import { MedaiChatComponent } from './shared/components/medai-chat/medai-chat.component';
import { IncomingCallComponent } from './shared/components/incoming-call/incoming-call.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MedaiChatComponent, CommonModule, IncomingCallComponent],
  template: `<router-outlet></router-outlet>@if (showMedAi) {<app-medai-chat></app-medai-chat>}<app-incoming-call></app-incoming-call>`,
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private userSub?: Subscription;
  private routerSub?: Subscription;
  showMedAi = true;

  constructor(private signalrService: SignalrService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.signalrService.startConnections().catch(() => {});
      } else {
        this.signalrService.stopConnections().catch(() => {});
      }
    });

    // Hide MedAI on admin, doctor, and chat routes
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      const url = e.urlAfterRedirects;
      this.showMedAi = !url.startsWith('/admin') && !url.startsWith('/doctor') && !url.includes('/chat') && !url.includes('/video-call');
    });
    // Initial check
    this.showMedAi = !this.router.url.startsWith('/admin') && !this.router.url.startsWith('/doctor') && !this.router.url.includes('/chat') && !this.router.url.includes('/video-call');
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }
}
