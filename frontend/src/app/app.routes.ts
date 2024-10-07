import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { InventoryComponent } from './inventory/inventory.component';
import { OrderComponent } from './order/order.component';
import { LoginComponent } from './auth/login.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Default route
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'inventory', component: InventoryComponent, canActivate: [AuthGuard] },
    { path: 'order', component: OrderComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
];
