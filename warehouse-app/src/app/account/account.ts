import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { DatePipe, CommonModule } from '@angular/common';

import { userService } from '../service/userService';

@Component({
  selector: 'app-account',
  imports: [RouterModule, ReactiveFormsModule, DatePipe, CommonModule],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account {
  route: ActivatedRoute = inject(ActivatedRoute);
  passwordType: string = 'password';

  user:any = null;
  message = "";
  error = "";

  constructor(private http:HttpClient,
              private router:Router,
              private userService:userService
              ){}

  ngOnInit() {
    this.loadUser();
  }

  loadUser(){
    const userId = Number(localStorage.getItem('userId'));
    this.userService.getUserById(userId).subscribe({
      next: model => {
        this.user = model
        this.updateForm.patchValue({
          name: this.user.name,
          phone: this.user.phoneNumber
      });
      },
      error: () => {
        this.error = "",
        setTimeout(() => {
          this.error = "Failed to load user"
        }, 500)
      }
    });
  }

  toggleIcon():string {
    return this.passwordType === 'password' ? 'assets/outside/reveal.png' : 'assets/outside/hidden.png';
  }
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  noColonValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || "";
    return value.includes(":") ? { invalidCharacter: true } : null;
  }
  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required, this.noColonValidator]),
    newPassword: new FormControl('', [Validators.required, this.noColonValidator]),
    confirmPassword: new FormControl('', Validators.required),
  })
  onResetPassword(){
    if (this.passwordForm.invalid) {
      this.error = "All fields are required";
      return;
    }

    const password = this.passwordForm.value.password;
    const newPassword = this.passwordForm.value.newPassword;
    const confirmPassword = this.passwordForm.value.confirmPassword;

    if (newPassword !== confirmPassword){
      this.error = "Confirm password must be the same as new password";
      return;
    }

    const updated = {
      password: password + ":" + newPassword
    };

    this.userService.updateUser(this.user.id, updated).subscribe({
      next: () => {
        this.message = "",
        setTimeout(() => {
          this.message = "Password updated successfully";
        }, 500)
      },
        error: err => {
          this.error = "",
          setTimeout(() => {
            this.error = err.error?.message
        }, 500)
      }
    });
  }

  updateForm = new FormGroup({
    name: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required)
  })
  onUpdate(){
    if (this.updateForm.invalid) {
      this.error = "All fields are required";
      return;
    }

    const updated = {
      name: this.updateForm.value.name,
      phoneNumber: this.updateForm.value.phone,
    };

    this.userService.updateUser(this.user.id, updated).subscribe({
      next: () => {
        this.message = "",
        setTimeout(() => {
          this.message = "User updated successfully";
          this.loadUser()
        }, 500)
      },
        error: () => {
        this.error = "",
        setTimeout(() => {
          this.error = "Failed to update user"
        }, 500)
      }
    });
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/']);
  }
}
