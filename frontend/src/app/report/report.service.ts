import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  // Get inventory report
  getInventoryReport(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/v1/report/inventory`);
  }

  // Get sales report
  getSalesReport(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/v1/report/sales`);
  }
}
