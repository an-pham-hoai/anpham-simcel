// src/app/layout/layout.component.ts
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';  // Import MatSidenavModule
import { MatToolbarModule } from '@angular/material/toolbar';  // Import MatToolbarModule
import { MatListModule } from '@angular/material/list';        // Import MatListModule
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';  // For routing to the Home, Inventory, and Order components

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,  // Standalone component
  imports: [
    CommonModule,
    MatSidenavModule,   // Import the Material Sidenav module
    MatToolbarModule,   // Import the Material Toolbar module
    MatListModule,      // Import the Material List module
    RouterModule        // Import RouterModule to allow navigation
  ]
})
export class LayoutComponent {}
