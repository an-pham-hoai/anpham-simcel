import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Inventory } from './inventory.model';
import { InventoryService } from './inventory.service';
import { InventoryDialogComponent } from './inventory-dialog/inventory-dialog.component';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  imports: [
    CommonModule,
    MatPaginatorModule,  // Ensure MatPaginatorModule is imported
    MatTableModule,
    MatSortModule,
    // Add other Material modules as needed
  ],
})
export class InventoryComponent implements OnInit {
  displayedColumns: string[] = ['sku', 'name', 'quantity', 'location', 'actions'];
  dataSource = new MatTableDataSource<Inventory>([]);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private inventoryService: InventoryService, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.inventoryService.getInventories(this.pageIndex + 1, this.pageSize).subscribe(response => {
      this.dataSource.data = response.data;
      this.totalItems = response.meta.totalItems;
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInventory();
  }

  onEditInventory(inventory: Inventory): void {

    this.inventoryService.getInventoryById(inventory.sku).subscribe({
      next: (inventory: any) => {
        const dialogRef = this.dialog.open(InventoryDialogComponent, {
          width: '400px',
          data: inventory.data, // Pass the fetched inventory data to the dialog
        });
  
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.loadInventory(); // Refresh the inventory list after closing the dialog
          }
        });
      },
      error: () => {
        this.snackBar.open('Failed to fetch inventory details', 'Close', { duration: 3000 });
      }
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
