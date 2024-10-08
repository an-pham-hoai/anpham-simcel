import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inventory } from './inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = `${environment.apiUrl}/v1/inventory`;

  constructor(private http: HttpClient) {}

  getInventories(page: number, size: number, sortBy: string, sortOrder: "asc" | "desc", search: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}`);
  }

  getInventoryById(sku: string): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.baseUrl}/${sku}`);
  }

  // Check if SKU is unique
  checkSkuUnique(sku: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-sku/${sku}`);
  }

  createInventory(inventory: Inventory): Observable<Inventory> {
    return this.http.post<Inventory>(this.baseUrl, inventory);
  }

  updateInventory(sku: string, inventory: Partial<Inventory>): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.baseUrl}/${sku}`, inventory);
  }

  deleteInventory(sku: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${sku}`);
  }
}
