import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ManagerGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate() {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    if (token && role === 'MANAGER') return true;

    this.router.navigate(['/']);
    return false;
  }
}