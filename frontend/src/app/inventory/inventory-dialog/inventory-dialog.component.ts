import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Inventory } from '../inventory.model';
import { InventoryService } from '../inventory.service';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-inventory-dialog',
  standalone: true, // Standalone component
  templateUrl: './inventory-dialog.component.html',
  styleUrls: ['./inventory-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FormsModule,
  ]
})
export class InventoryDialogComponent implements OnInit {
  isEdit: boolean = false;
  loading: boolean = false;
  skuError: string | null = null;
  formError: string | null = null;
  inventory: Inventory = { sku: '', name: '', quantity: 0, location: '' }; // Initialize the inventory object

  constructor(
    public dialogRef: MatDialogRef<InventoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Inventory,
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data; // If data exists, we are in edit mode
    if (this.isEdit) {
      // Bind the received data to the inventory object
      this.inventory = { ...this.data };
      console.log('inventory', this.inventory);
    }
  }

  r(s: any):boolean {
    return s != null && s.toString().trim().length > 0;
  }

  // Handle the SKU uniqueness check when SKU field loses focus
  async checkSkuUniqueness() {
    console.log(this.isEdit, this.inventory);
    if (!this.isEdit && this.inventory.sku) {
      this.inventoryService.checkSkuUnique(this.inventory.sku).subscribe({
        next: (isUnique) => {
          console.log('isUnique', isUnique);
          this.skuError = isUnique ? null : 'SKU already exists';
        },
        error: () => {
          this.skuError = 'Error checking SKU uniqueness';
        }
      });
    }
  }

  save(): void {
    // Validate fields before submission
    if (this.validateForm()) {
      this.loading = true; // Show loading indicator

      if (this.isEdit) {
        this.updateInventory();
      } else {
        this.checkSkuUniquenessBeforeSubmit();
      }
    }
  }

  // Validate the form before submitting
  private validateForm(): boolean {
    if (!this.r(this.inventory.sku) || !this.r(this.inventory.name) || 
      !this.r(this.inventory.quantity) || !this.r(this.inventory.location)) {
      this.formError = 'All fields are required';
      return false;
    }
    if (this.skuError) {
      this.formError = 'Fix the SKU error before submission';
      return false;
    }
    this.formError = null;
    return true;
  }

  // Check SKU uniqueness again before submit
  private checkSkuUniquenessBeforeSubmit() {
    this.inventoryService.checkSkuUnique(this.inventory.sku).subscribe({
      next: (isUnique) => {
        if (isUnique) {
          this.createInventory();
        } else {
          this.loading = false;
          this.skuError = 'SKU already exists';
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to validate SKU', 'Close', { duration: 3000 });
      }
    });
  }

  private createInventory(): void {
    this.inventoryService.createInventory(this.inventory).subscribe({
      next: () => {
        this.loading = false; // Hide loading indicator
        this.snackBar.open('Inventory created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true); // Close the dialog and pass `true` to indicate success
      },
      error: () => {
        this.loading = false; // Hide loading indicator
        this.snackBar.open('Failed to create inventory', 'Close', { duration: 3000 });
      }
    });
  }

  private updateInventory(): void {
    // Create a copy of the inventory object without the properties that should not be sent
    const { _id, createdAt, updatedAt, __v, ...inventoryToUpdate } = this.inventory as any;

    this.inventoryService.updateInventory(this.inventory.sku, inventoryToUpdate).subscribe({
      next: () => {
        this.loading = false; // Hide loading indicator
        this.snackBar.open('Inventory updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true); // Close the dialog and pass `true` to indicate success
      },
      error: () => {
        this.loading = false; // Hide loading indicator
        this.snackBar.open('Failed to update inventory', 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
