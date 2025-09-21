import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  longUrl : string = '';
  shortId : string = '';
  shortUrl : string = '';
  // domainName : string = "https://nanofy.com/";
  domainName : string = "https://api.chirag.engineer/";
  isUrlAlreadyShort : boolean = false;
  isValidUrl : boolean = true;
  clickCount: number | null = null;
  userShortUrls : any[] = [];
  deleteModalOpen : boolean = false;
  urlToDelete : string = "";
  urlRegex = /^(https?:\/\/)((?!-)(?!.*--)[a-zA-Z\-0-9]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}(\/[^\s]*)?$/;
  copiedStates : { [link : string] : string } = {};

  constructor(private http: HttpClient, private router: Router, private auth : AuthService) {}

  ngOnInit() {
    this.fetchShortUrls();
  }

  shorten() {
    if (!this.longUrl) {
      this.isValidUrl = false;
      this.isUrlAlreadyShort = false;
      this.shortUrl = "";
    }
    this.isValidUrl = this.urlRegex.test(this.longUrl);

    if(!this.isValidUrl) {
      this.isUrlAlreadyShort = false;
      this.shortUrl = "";
      return;
    }

    else if(this.longUrl.length <= (this.domainName.length + 6)) {
      this.isUrlAlreadyShort = true;
      this.shortUrl = "";
      return;
    }

    this.http
      .post<{ shortId: string }>('https://api.chirag.engineer/short', {
        redirectUrl: this.longUrl,
      })
      .subscribe({
        next: ({ shortId }) => {
          this.shortId = shortId;
          this.shortUrl = `https://api.chirag.engineer/${shortId}`;
          this.clickCount = 0;
          this.isUrlAlreadyShort = false;
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            alert("Your token or session is expired!! Login again")
          }
          else {
            alert('Server error – check backend console.')
          }
        }
      });
  }

  getTotalClicks() {
    this.http
            .get<{ totalClicks: number }>(
              `https://api.chirag.engineer/analytics/${this.shortId}`
            )
            .subscribe({
              next : (analytics) => {
                console.log(analytics.totalClicks);
                return this.clickCount = analytics.totalClicks;
              },
              error: (err: HttpErrorResponse) => {
                if (err.status === 401) {
                  alert("Your token or session is expired!! Login again")
                }
                else {
                  alert('Server error – check backend console.')
                }
              }
            })
  }

  goToHome() {
    this.router.navigateByUrl('/shortUrl').then(() => {
      window.location.reload(); 
    });
  }

  logOut() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  fetchShortUrls() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    this.http.get<{ shortUrls : any[] }>(
      "https://api.chirag.engineer/shortUrls",
    ).subscribe({
      next: (res) => this.userShortUrls = res.shortUrls,
      error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            alert("Your token or session is expired!! Login again")
          }
          else {
            alert('Server error – check backend console.')
          }
        }
    });
  }

  copyToClipboard(link: string) {
  navigator.clipboard.writeText(link).then(() => {
    console.log("Copied to clipboard ✅");
    this.copiedStates[link] = "Copied";

    setTimeout(() => {
      this.copiedStates[link] = "Copy";
    }, 2000);
  });

}
  deleteShortUrl(shortId : string) {
    this.urlToDelete = shortId;
    this.deleteModalOpen = true;
  }

  confirmDelete() {
    if (this.urlToDelete) {
      this.http.post<{ deleted: boolean }>(
        "https://api.chirag.engineer/deleteShortUrl",
        { urlShortId : this.urlToDelete }
      ).subscribe({
        next: (res) => {
          if (res.deleted) {
            console.log("Deleted the url successfully!!");
            this.fetchShortUrls(); // Refresh shortUrls list
          } else {
            console.log("Url is not deleted, there is some issue in deleting the url");
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            alert("Your token or session is expired!! Login again")
          }
          else {
            alert('Server error – check backend console.')
          }
        }
      });
    }
    this.closeModal();
  }

  closeModal() {
    this.deleteModalOpen = false;
  }
}
