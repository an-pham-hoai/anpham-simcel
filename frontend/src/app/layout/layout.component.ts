import { Component, HostListener, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';  // Import MatSidenav for controlling the sidebar
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,  // Import the Material Sidenav module
    MatToolbarModule,  // Import the Material Toolbar module
    MatListModule,     // Import the Material List module
    MatIconModule,
    RouterModule       // Import RouterModule to allow navigation
  ]
})
export class LayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;  // Access sidenav instance

  isDesktop: boolean = true;  // Determine if in desktop mode

  constructor(private router: Router) {
    this.onResize();  // Set initial state based on screen size
  }

  // Detect window resize to switch between mobile and desktop
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (!this.sidenav) return;
    this.isDesktop = window.innerWidth >= 768;  // Define breakpoint for desktop vs mobile
    if (this.isDesktop) {
      this.sidenav.open();  // Keep sidebar open on larger screens
    } else {
      this.sidenav.close(); // Close the sidebar on smaller screens
    }
  }

  // Toggle sidebar visibility in mobile mode
  toggleSidebar(): void {
    this.sidenav.toggle();
  }

  // Close the sidebar in mobile view
  closeMenu(): void {
    if (!this.isDesktop) {
      this.sidenav.close();
    }
  }

  // Perform logout action and navigate to login
  logout(): void {
    localStorage.removeItem(AuthService.TokenKey);
    this.router.navigate(['/login']);  // Navigate to login after logout
  }
}
