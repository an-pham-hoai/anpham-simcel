import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { OrderService } from '../order.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { InventoryService } from '../../inventory/inventory.service';

@Component({
    selector: 'app-create-order-dialog',
    templateUrl: './create-order-dialog.component.html',
    styleUrls: ['./create-order-dialog.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        FormsModule,
        MatIconModule,
        MatSelectModule,
    ],
})
export class CreateOrderDialogComponent implements OnInit {
    order: any = {
        orderNumber: '',
        customerName: '',
        status: 'pending', // Default status
        totalAmount: 0,
        items: [],
    };
    isEditMode = false;
    availableSkus: string[] = [];  // List of available SKUs

    constructor(
        public dialogRef: MatDialogRef<CreateOrderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private orderService: OrderService,
        private inventoryService: InventoryService,  // Assuming SKUs come from inventory
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        if (this.data && this.data.order) {
            this.isEditMode = true;
            this.order = { ...this.data.order }; // Load order data for edit mode
            console.log('edit order', this.order);
        } else {
            this.addOrderItem(); // Start with one order item for new orders
        }

        this.loadAvailableSkus();  // Fetch the available SKUs
    }

    // Load available SKUs from the inventory service
    loadAvailableSkus(): void {
        this.inventoryService.getAvailableSkus().subscribe((skus: string[]) => {
            this.availableSkus = skus;
        });
    }

    // Add a new order item
    addOrderItem(): void {
        this.order.items.push({
            sku: '',
            quantity: 1,
            price: 0,
        });
    }

    // Remove an order item
    removeOrderItem(index: number): void {
        if (this.order.items.length > 1) {
            this.order.items.splice(index, 1);
        }
    }

    // Calculate the total amount based on items
    calculateTotalAmount(): number {
        return this.order.items.reduce((total: any, item: any) => total + (item.quantity), 0);
    }

    // Submit order (create or update)
    saveOrder(): void {
        if (!this.order.orderNumber || !this.order.customerName || this.order.items.some((item: any) => !item.sku || item.quantity <= 0)) {
            this.snackBar.open('Please fill all required fields and ensure quantities are positive.', 'Close', {
                duration: 3000,
            });
            return;
        }

        this.order.totalAmount = this.calculateTotalAmount();

        if (this.isEditMode) {
            // Update order
            this.orderService.updateOrder(this.data.order._id, this.order).subscribe(() => {
                this.dialogRef.close(true);
                this.snackBar.open('Order updated successfully!', 'Close', { duration: 3000 });
            });
        } else {
            // Create new order
            this.orderService.createOrder(this.order).subscribe(() => {
                this.dialogRef.close(true);
                this.snackBar.open('Order created successfully!', 'Close', { duration: 3000 });
            });
        }
    }

    // Close dialog without saving
    closeDialog(): void {
        this.dialogRef.close();
    }
}


