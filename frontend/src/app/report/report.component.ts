import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from './report.service';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalesReport } from './sales-report.model';

@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css'],
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
export class ReportComponent implements OnInit {
    levelDisplayedColumns: string[] = ['warehouse', 'totalQuantity'];
    levelDataSource: any;
    levelTotalLength: number = 0;

    displayedColumns: string[] = ['month', 'year', 'totalOrders', 'totalQuantity'];
    dataSource?: any;

    totalLength = 0;
    pageSize = 10;

    @ViewChild(MatPaginator) paginator?: MatPaginator;

    @ViewChild('levelPaginator') levelPaginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    inventoryReport: any[] = [];
    lowStockItems: any[] = [];
    loading: boolean = true;
    error: string = '';

    constructor(
        private reportService: ReportService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.fetchReports();
    }

    fetchReports() {
        this.loading = true;
        this.error = '';

        // Fetch Inventory Report
        this.reportService.getInventoryReport()
            .subscribe({
                next: (response) => {
                    this.loading = false;
                    console.log('next', response);

                    this.levelDataSource = new MatTableDataSource(response.inventoryLevels);
                    this.levelTotalLength = response.inventoryLevels.length;
                    this.levelDataSource.paginator = this.levelPaginator as any;

                    this.lowStockItems = response.lowStockItems;
                },
                error: () => {
                    this.snackBar.open('Failed to load inventory report', 'Close', { duration: 3000 });
                    this.loading = false;
                },
            });

        // Fetch Sales Report
        this.reportService.getSalesReport()
            .subscribe({
                next: (data) => {
                    this.loading = false;
                    console.log('next', data);
                    this.dataSource = new MatTableDataSource(data);
                    this.totalLength = data.length;
                    this.dataSource.paginator = this.paginator as any;
                    this.dataSource.sort = this.sort as any;
                },
                error: () => {
                    this.snackBar.open('Failed to load sales report', 'Close', { duration: 3000 });
                    this.loading = false;
                },
            });

    }
}
