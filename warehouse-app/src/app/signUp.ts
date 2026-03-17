import { Component } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { signUpComponent } from "./signUpComponent";
import { ads } from "./ads";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-sign-up',
  imports: [RouterModule, signUpComponent, ads, ReactiveFormsModule, CommonModule],
  templateUrl: './html/signUp.html',
  styleUrls: ['./css/signLog.css']
})
export class SignUpComponent { 
  error:string = "";

  constructor(private http:HttpClient, private router: Router){}

  noColonValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || "";
    return value.includes(":") ? { invalidCharacter: true } : null;
  }
  signUpForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    password: new FormControl('', [Validators.required, this.noColonValidator]),
    passwordConfirm: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    role: new FormControl('ADMIN', Validators.required)
  })
  async submitSignUp(){
    const name = this.signUpForm.value.name ?? '';
    const email = this.signUpForm.value.email ?? '';
    const password = this.signUpForm.value.password ?? '';
    const passwordConfirm = this.signUpForm.value.passwordConfirm ?? '';
    const phoneNumber = this.signUpForm.value.phone ?? '';
    const role = this.signUpForm.value.role ?? '';

    if(password!==passwordConfirm) {
      this.error = "Confirm password has to match the password";
      return;
    }

    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const signUpData = {name, email, password, phoneNumber, role};

    this.http.post('http://127.0.0.1:8081/api/auth/register', signUpData)
    .subscribe({
      next: res => {
        this.signUpForm.reset();
        this.router.navigate(['login', 'Sign Up Successful']);
      },
      error: (err) => {
        this.error = err.error?.message 
                || err.message 
                || 'Sign Up Failed, try new email'
      }
    });
  }
}