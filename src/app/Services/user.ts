import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class User {
  private apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {
  }

  public healthCheck(url:string = environment.healthCheck) {
    return this.http.get<boolean>(`${this.apiUrl}${url}`);
  }
  

  public apiCall<TResponse = unknown>(url: string, data: unknown): Observable<TResponse> {
    return this.http.post<TResponse>(`${this.apiUrl}${url}`, data);
  }
}
