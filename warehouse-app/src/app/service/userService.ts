import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class userService {

  private readonly allUserURL = "http://127.0.0.1:8081/api/users/all";
  private readonly userIdURL = "http://127.0.0.1:8081/api/users/id/";
  private readonly updateURL = "http://127.0.0.1:8081/api/users/update/";
  private readonly deleteURL = "http://127.0.0.1:8081/api/users/delete/";

  constructor(private http: HttpClient) {}

  getAllUser(): Observable<any[]> {
    return this.http.get<any>(this.allUserURL).pipe(
        map(res => res.users)
    );
  }

  getUserById(id:number): Observable<any[]>{
    return this.http.get<any>(this.userIdURL + id).pipe(
        map(res => res.user)
    );
  }

  updateUser(id:number, data:any){
    return this.http.put(this.updateURL + id, data);
  }

  deleteUser(id:number){
    return this.http.delete(this.deleteURL + id);
  }
}
