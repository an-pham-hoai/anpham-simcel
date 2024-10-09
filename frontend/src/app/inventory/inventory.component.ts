import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Inventory } from './inventory.model';
import { InventoryService } from './inventory.service';
import { InventoryDialogComponent } from './inventory-dialog/inventory-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  imports: [
    CommonModule,
    MatPaginatorModule,  // Ensure MatPaginatorModule is imported
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatInputModule,
    // Add other Material modules as needed
  ],
})
export class InventoryComponent implements OnInit {
  displayedColumns: string[] = ['sku', 'name', 'quantity', 'location', 'actions'];
  dataSource = new MatTableDataSource<Inventory>([]);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  sortBy = 'sku';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchQuery = '';
  loading = false;

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.loading = true;
    this.inventoryService
      .getInventories(this.pageIndex + 1, this.pageSize, this.sortBy, this.sortOrder, this.searchQuery)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data;
          this.totalItems = response.totalItems;
          this.loading = false;
          console.log('next', response.data);
        },
        error: () => {
          this.snackBar.open('Failed to load inventory data', 'Close', { duration: 3000 });
          this.loading = false;
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInventory();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value.trim().toLowerCase();
    this.pageIndex = 0; // Reset to first page when searching
    this.loadInventory();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortOrder = sort.direction || 'asc'; // Default to ascending if no sort order
    this.loadInventory();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(InventoryDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadInventory(); // Reload inventories if a new one was created
      }
    });
  }

  onEditInventory(inventory: Inventory): void {
    this.inventoryService.getInventoryById(inventory.sku).subscribe({
      next: (inventory: any) => {
        const dialogRef = this.dialog.open(InventoryDialogComponent, {
          width: '400px',
          data: inventory.data,
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.loadInventory(); // Refresh the inventory list after closing the dialog
          }
        });
      },
      error: () => {
        this.snackBar.open('Failed to fetch inventory details', 'Close', { duration: 3000 });
      },
    });
  }

  onDeleteInventory(sku: string): void {
    if (confirm('Are you sure you want to delete this inventory?')) {
      this.inventoryService.deleteInventory(sku).subscribe(() => {
        this.loadInventory();
      });
    }
  }
}
