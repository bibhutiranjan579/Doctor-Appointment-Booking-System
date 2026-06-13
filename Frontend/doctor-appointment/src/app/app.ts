import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { SignalrService } from './core/services/signalr.service';
import { AuthService } from './core/services/auth.service';
import { MedaiChatComponent } from './shared/components/medai-chat/medai-chat.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MedaiChatComponent, CommonModule],
  template: `<router-outlet></router-outlet>@if (showMedAi) {<app-medai-chat></app-medai-chat>}`,
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

    // Hide MedAI on admin and doctor routes
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.showMedAi = !e.urlAfterRedirects.startsWith('/admin') && !e.urlAfterRedirects.startsWith('/doctor');
    });
    // Initial check
    this.showMedAi = !this.router.url.startsWith('/admin') && !this.router.url.startsWith('/doctor');
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }
}
