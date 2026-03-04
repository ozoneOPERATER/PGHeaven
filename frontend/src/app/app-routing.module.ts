import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PgListComponent } from './components/pg-list/pg-list.component';
import { PgDetailComponent } from './components/pg-detail/pg-detail.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminPgListComponent } from './components/admin-pg-list/admin-pg-list.component';
import { AdminAddPgComponent } from './components/admin-add-pg/admin-add-pg.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminSettingsComponent } from './components/admin-settings/admin-settings.component';
import { AdminHelpComponent } from './components/admin-help/admin-help.component';
import { AdminServicesComponent } from './components/admin-services/admin-services.component';
import { AdminOrdersComponent } from './components/admin-orders/admin-orders.component';
import { AdminComplaintsComponent } from './components/admin-complaints/admin-complaints.component';
import { CustomerServiceComponent } from './components/customer-service/customer-service.component';
import { CustomerComplaintComponent } from './components/customer-complaint/customer-complaint.component';
import { CustomerOrderComponent } from './components/customer-order/customer-order.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';
import { AuthPageComponent } from './components/auth-page/auth-page.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: PgListComponent },
  { path: 'pg/:id', component: PgDetailComponent },
  { path: 'auth', component: AuthPageComponent },
  { path: 'dashboard', component: UserDashboardComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'help/service', component: CustomerServiceComponent },
  { path: 'help/complaint', component: CustomerComplaintComponent },
  { path: 'help/order', component: CustomerOrderComponent },
  { path: 'thankyou', component: ThankYouComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'pgs/add', component: AdminAddPgComponent },
      { path: 'pgs/edit/:id', component: AdminAddPgComponent },
      { path: 'pgs', component: AdminPgListComponent },
      { path: 'services', component: AdminServicesComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'complaints', component: AdminComplaintsComponent },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'help', component: AdminHelpComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
