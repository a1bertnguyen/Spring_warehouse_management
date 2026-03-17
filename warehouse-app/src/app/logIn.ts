import { Component, inject } from "@angular/core";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { logInComponent } from "./logInComponent";
import { ads } from "./ads";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule, RouterModule, logInComponent, ads, CommonModule],
  templateUrl: './html/logIn.html',
  styleUrls: ['./css/signLog.css']
})
export class LogInComponent { 
  route: ActivatedRoute = inject(ActivatedRoute);
  message:string | null = '';
  error:string | null = '';

  constructor(private http:HttpClient, private router:Router){}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.message = params.get("message");
    });
  }

  logInForm = new FormGroup({
    email: new FormControl('', Validators.email),
    password: new FormControl('', Validators.required)
  })

  async submitLogIn(){
    const email = this.logInForm.value.email ?? '';
    const password = this.logInForm.value.password ?? '';

    const logInData = {email, password};
    let accessToken: string | undefined;
    let userId: number | undefined;
    let role: string | undefined;

    this.http.post('http://127.0.0.1:8081/api/auth/login', logInData)
    .subscribe({
      next: (response:any) => {
        accessToken = response.token;
        localStorage.setItem('authToken', accessToken ?? '');

        userId = Number(response.userId);
        localStorage.setItem('userId', userId?.toString());

        role = response.role;
        localStorage.setItem('role', role ?? '');
        this.router.navigate([role === "ADMIN" ? "admin" : "warehouse-manager"]);
        },
      error: (err) => {
        this.error = err.error?.message 
                || "Login failed";
      }
    });
  }
}