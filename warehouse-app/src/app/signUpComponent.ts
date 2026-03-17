import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'signup-input',
  imports: [ReactiveFormsModule, CommonModule],
  template: `
  <div [formGroup]="signUpForm">
    <div class="name container">
        <label for="name-input">Username</label>
        <input type="text" id="name-input" formControlName="name"/>

        <p class="error"
            *ngIf="signUpForm.get('name')?.hasError('required') && signUpForm.get('name')?.touched">
            Username is required
        </p>
    </div>

    <div class="email container">
        <label for="email-input">Email</label>
        <input type="email" id="email-input" formControlName="email"/>

        <p class="error"
           *ngIf="signUpForm.get('email')?.hasError('email') && signUpForm.get('email')?.touched">
           Please enter a valid email
        </p>
    </div>

    <div class="password container">
    <label>Password</label>
        <div class="input-wrapper">
            <input [type]="passwordType" id="password-input" formControlName="password" autocomplete="off"/>
            <img [src]="toggleIcon()" (click)="togglePasswordVisibility()" class="reveal-icon" />
        </div>

        <p class="error"
           *ngIf="signUpForm.get('password')?.hasError('required') && signUpForm.get('password')?.touched">
           Password is required
        </p>
        <p class="error" *ngIf="signUpForm.get('password')?.hasError('invalidCharacter')">
            Password cannot contain ":"
        </p>
    </div>

    <div class="password-confirm container">
        <label>Password confirm</label>
        <input [type]="passwordType" id="password-confirm-input" formControlName="passwordConfirm" autocomplete="off"/>

        <p class="error"
           *ngIf="signUpForm.get('passwordConfirm')?.hasError('required') && signUpForm.get('passwordConfirm')?.touched">
           Please confirm your password
        </p>
    </div>

    <div class="phone container">
        <label>Phone Number</label>
        <input type="text" id="phone-input" formControlName="phone"/>

        <p class="error"
           *ngIf="signUpForm.get('phone')?.hasError('required') && signUpForm.get('phone')?.touched">
           Phone number is required
        </p>
    </div>

    <div class="role container">
        <label for="role-input">Role</label>
        <select id="role-input" class="role container" name="role" formControlName="role" required>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Warehouse Manager</option>
        </select>
    </div>
  </div>
  `,
  styleUrls: ['css/signLogComp.css']
})

export class signUpComponent {
  @Input({ required: true }) signUpForm!: FormGroup;
  passwordType: string = 'password';

  toggleIcon():string {
    return this.passwordType === 'password' ? 'assets/outside/reveal.png' : 'assets/outside/hidden.png';
  }
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}