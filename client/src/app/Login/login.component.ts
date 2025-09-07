import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  isInvalidCredentials : boolean = false;
  isEmptyCredentials : boolean = false;

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  login() {
    if(!this.email || !this.password) {
      this.isEmptyCredentials = true;
      this.isInvalidCredentials = false;
      return;
    }
    this.http.post<{ success: boolean, accessToken? : string, refreshToken? : string }>('http://localhost:8000/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res.success && res.accessToken && res.refreshToken) {
          this.auth.saveTokens(res.accessToken, res.refreshToken);
          this.router.navigate(['/shortUrl']);
        } else {
          this.isInvalidCredentials = true;
          this.isEmptyCredentials = false;
          this.email = "";
          this.password = "";
        }
      },
      error: () => alert('Server error – check backend console.')
    });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
