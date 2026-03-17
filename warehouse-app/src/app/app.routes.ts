import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { SignUpComponent } from './signUp';
import { LogInComponent } from './logIn';

import { Admin } from './admin/admin';
import { manageUser } from './admin/manageUser';
import { Statistic } from './admin/statistic';

import { Account } from './account/account';
import { AuthGuard } from './guard/AuthGuard';
import { AdminGuard } from './guard/AdminGuard';
import { ManagerGuard } from './guard/ManagerGuard';

import { WarehouseManager } from './warehouse-manager/warehouse-manager';
import { Category } from './warehouse-manager/category';
import { Supplier } from './warehouse-manager/supplier';
import { Transaction } from './warehouse-manager/transaction';
import { transactionDetail } from './warehouse-manager/transaction-details';
import { Product } from './warehouse-manager/product';
import { Inventory } from './warehouse-manager/inventory';

import { TaskComponent } from './admin/task';
import { TaskDetailsComponent } from './admin/task-details';

const routeConfig: Routes = [
  {
    path: '',
    component: LogInComponent,
    title: 'Log in page'
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    title: 'Sign up page'
  },
  {
    path: 'login/:message',
    component: LogInComponent,
    title: 'Log in page'
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [() => inject(AdminGuard).canActivate()],
    canActivateChild: [() => inject(AdminGuard).canActivate()],
    title: 'admin',
    children: [{
      path: '',
      component: Account
    },
    {
      path:'manage-user',
      component: manageUser
    },
    {
      path: 'account',
      component: Account,
    },
    {
      path: 'statistic',
      component: Statistic
    },
    {
      path: 'category',
      component: Category
    },
    {
      path: 'supplier',
      component: Supplier
    },
    {
      path: 'transaction/:type',
      component: Transaction
    },
    {
      path: 'product',
      component: Product
    },
    {
      path: 'task',
      component: TaskComponent
    }]
  },
  {
    path:'warehouse-manager',
    component: WarehouseManager,
    canActivate: [() => inject(ManagerGuard).canActivate()],
    canActivateChild: [() => inject(ManagerGuard).canActivate()],
    title:'Warehouse-manager',
    children:[{
      path: '',
      component: Account
    },
    {
      path: 'account',
      component: Account
    },
    {
      path: 'category',
      component: Category
    },
    {
      path: 'supplier',
      component: Supplier
    },
    {
      path: 'transaction/:type',
      component: Transaction
    },
    {
      path: 'product',
      component: Product
    },
    {
      path: 'inventory',
      component: Inventory
    },
    {
      path: 'task',
      component: TaskComponent
    }]
  },
  {
    path: 'transaction-detail/:id',
    component: transactionDetail,
    canActivate: [() => inject(AuthGuard).canActivate()],
    canActivateChild: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'task-details/:id',
    component: TaskDetailsComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
    canActivateChild: [() => inject(AuthGuard).canActivate()]
  }
];
export default routeConfig;