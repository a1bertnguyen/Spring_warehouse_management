import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class taskService {

    //admin only
  private readonly allAdminURL = "http://127.0.0.1:8081/api/tasks/all";
  private readonly rngURL = "http://127.0.0.1:8081/api/tasks/assign-random";
  private readonly updateURL = "http://127.0.0.1:8081/api/tasks/";
  private readonly deleteURL = "http://127.0.0.1:8081/api/tasks/delete/";
  private readonly addURL = "http://localhost:8081/api/tasks/add";

  constructor(private http: HttpClient) {}

  getAllAdminTask(): Observable<any[]> {
    return this.http.get<any>(this.allAdminURL).pipe(
        map(res => res.tasks)
    );
  }

  getRngTask(){
    return this.http.post(this.rngURL, null);
  }

  updateTask(id:number, data:any){
    return this.http.put(this.updateURL + id, data);
  }

  deleteTask(id:number){
    return this.http.delete(this.deleteURL + id);
  }

  addTask(data:any){
    return this.http.post(this.addURL, data);
  }

    //manager only
  
  private readonly updateStatusURL = "http://127.0.0.1:8081/api/tasks/";
  private readonly allTaskURL = "http://localhost:8081/api/tasks/user/";

  updateTaskStatus(id:number, data:any){
    return this.http.patch(this.updateStatusURL + id + "/status?status=" + data, {});
  }

  getAllManagerTask(id:number): Observable<any[]> {
    return this.http.get<any>(this.allTaskURL + id).pipe(
        map(res => res.tasks)
    );
  }

  //feature
  private readonly idURL = "http://127.0.0.1:8081/api/tasks/";
  private readonly searchURL = "http://localhost:8081/api/tasks/search?input=";

  getTaskById(id:number): Observable<any[]> {
    return this.http.get<any>(this.idURL + id).pipe(
        map(res => res.task)
    );
  }

  searchTask(input:any): Observable<any[]>{
    return this.http.get<any>(this.searchURL + input).pipe(
        map(res => res.tasks)
    );
  }
}