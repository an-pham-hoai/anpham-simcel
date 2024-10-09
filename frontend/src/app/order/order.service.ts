import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from './order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = `${environment.apiUrl}/v1/orders`;

  constructor(private http: HttpClient) { }

  // Fetch all orders with pagination, sorting, and optional search
  getOrders(
    page: number = 1,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'asc',
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.baseUrl}`, { params });
  }

  // Get a specific order by ID
  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }

  // Create a new order
  createOrder(order: Order): Observable<Order> {
    let { totalAmount, status, ...orderDto } = order;
    let itemsDto: any[] = [];

    orderDto.items.forEach(item => {
      let {price, ...itemDto} = item;
      itemsDto.push(itemDto);
    });

    orderDto.items = itemsDto;
    return this.http.post<Order>(`${this.baseUrl}`, orderDto);
  }

  // Update an existing order
  updateOrder(orderId: string, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${orderId}`, order);
  }

  // Delete an order by ID
  deleteOrder(orderId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${orderId}`);
  }
}
