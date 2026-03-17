import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate() {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    if (token && role === 'ADMIN') return true;

    this.router.navigate(['/']);
    return false;
  }
}