import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  emailRegex = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
  strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  isInvalidCredentials : boolean = false; 
  isInvalidEmail : boolean = false;
  isInvalidPassword : boolean = false;
  isEmailRegistered : boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  signup() {
    if(!this.email || !this.password ) {
      this.isInvalidCredentials = true;
      this.isInvalidEmail = false;
      this.isInvalidPassword = false;
      this.isEmailRegistered = false;
      return;
    }

    else if(!this.emailRegex.test(this.email)) {
      this.isInvalidEmail = true;
      this.isInvalidCredentials = false;
      this.isInvalidPassword = false;
      this.isEmailRegistered = false;
      this.password = "";
      return;
    }

    else if(!this.strongPasswordRegex.test(this.password)) {
      this.isInvalidPassword = true;
      this.isInvalidEmail = false;
      this.isInvalidCredentials = false;
      this.isEmailRegistered = false;
      this.password = "";
      return;
    }

    else {
      this.http.post<{ success: boolean, msg ?: string }>('https://api.chirag.engineer/auth/signup', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res.success) {
          console.log("Signup successfull!!");
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        if (err.status === 400 && err.error.msg) {
        this.isEmailRegistered = true;
        this.isInvalidCredentials = false;
        this.isInvalidEmail = false;
        this.isInvalidPassword = false;
        } else {
          alert("Server error – please try again later.");
        }
      }});
    }
  }

  login() {
    this.router.navigate(['/login']);
  }
}
