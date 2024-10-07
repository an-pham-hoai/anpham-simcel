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
    FormsModule,
  ]
})
export class InventoryDialogComponent implements OnInit {
  isEdit: boolean = false;
  inventory: Inventory = { sku: '', name: '', quantity: 0, location: '' }; // Initialize the inventory object

  constructor(
    public dialogRef: MatDialogRef<InventoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Inventory,
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar
  ) {
    console.log('data', data);
  }

  ngOnInit(): void {
    this.isEdit = !!this.data; // If data exists, we are in edit mode
    if (this.isEdit) {
      // Bind the received data to the inventory object
      this.inventory = { ...this.data };
      console.log('edit mode', this.inventory);
    }
  }

  save(): void {
    if (this.isEdit) {
      this.updateInventory();
    } else {
      this.createInventory();
    }
  }

  private createInventory(): void {
    this.inventoryService.createInventory(this.inventory).subscribe({
      next: () => {
        this.snackBar.open('Inventory created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true); // Close the dialog and pass `true` to indicate success
      },
      error: () => {
        this.snackBar.open('Failed to create inventory', 'Close', { duration: 3000 });
      }
    });
  }

  private updateInventory(): void {
    // Create a copy of the inventory object without the properties that should not be sent
    const { _id, createdAt, updatedAt, __v, ...inventoryToUpdate } = this.inventory as any;

    this.inventoryService.updateInventory(this.inventory.sku, inventoryToUpdate).subscribe({
      next: () => {
        this.snackBar.open('Inventory updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true); // Close the dialog and pass `true` to indicate success
      },
      error: () => {
        this.snackBar.open('Failed to update inventory', 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
