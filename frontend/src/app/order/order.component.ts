import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { OrderService } from './order.service';
import { CommonModule } from '@angular/common';
import { CreateOrderDialogComponent } from './order-dialog/create-order-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar'; // For notification/snackbar

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    // Add other Material modules as needed
  ],
})
export class OrderComponent implements OnInit {
  displayedColumns: string[] = ['orderNumber', 'customerName', 'status', 'totalAmount', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource([]);

  // Pagination and sorting
  totalItems = 0;
  page = 1;
  size = 10;
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'asc';
  search = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private orderService: OrderService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    // Fetch the orders with pagination, sorting, and search
    this.orderService.getOrders(this.page, this.size, this.sortBy, this.sortOrder, this.search)
      .subscribe((response: any) => {
        this.dataSource.data = response.data;
        this.totalItems = response.totalItems;
      });
  }

  // Handle search
  onSearch(): void {
    this.page = 1;
    this.loadOrders();
  }

  // Handle sort change
  onSortChange(sortState: any): void {
    this.sortBy = sortState.active;
    this.sortOrder = sortState.direction === 'asc' ? 'asc' : 'desc';
    this.loadOrders();
  }

  // Handle page change (pagination)
  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.loadOrders();
  }

  // Open dialog to create a new order
  createNewOrder(): void {
    const dialogRef = this.dialog.open(CreateOrderDialogComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrders(); // Reload orders after a new one is created
      }
    });
  }

  // Edit order logic
  editOrder(orderId: string): void {
    const order = this.dataSource.data.find((order: any) => order._id === orderId);

    const dialogRef = this.dialog.open(CreateOrderDialogComponent, {
      width: '700px',
      data: { order }, // Pass the existing order data to the dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrders(); // Reload the table after editing
        this.snackBar.open('Order updated successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  // Delete order logic
  deleteOrder(orderId: string): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(orderId).subscribe(() => {
        this.loadOrders(); // Reload the table after deleting
        this.snackBar.open('Order deleted successfully!', 'Close', {
          duration: 3000,
        });
      });
    }
  }
}
