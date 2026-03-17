import { Component, Input } from "@angular/core";
import { FormGroup, FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
    selector: 'login-input',
    imports:[ReactiveFormsModule],
    template:`
    <div [formGroup]="logInForm">
    <div class="email-container">
        <label class="email-input">Email</label>
        <input type="email" id="email-input" name="email" formControlName="email" required/>
    </div>
    <div class="password-container">
        <label for="password-input">Password</label>
        <div class="input-wrapper">
            <input
                [type]="passwordType"
                id="password-input" name="password"
                formControlName="password"
                required autocomplete="off"
            />
            <img
                [src]="toggleIcon()"
                alt="Toggle password visibility"
                (click)="togglePasswordVisibility()"
                class="reveal-icon"
            />
        </div>
    </div>
    </div>
    `,
    styleUrls: ['css/signLogComp.css']
})

export class logInComponent{
    @Input({required: true}) logInForm!:FormGroup;
    passwordType: string = 'password';

  toggleIcon():string {
    return this.passwordType === 'password' ? 'assets/outside/reveal.png' : 'assets/outside/hidden.png';
  }
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}