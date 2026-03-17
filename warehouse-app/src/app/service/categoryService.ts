import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class categoryService {

  private readonly allURL = "http://127.0.0.1:8081/api/categories/all";
  private readonly IdURL = "http://127.0.0.1:8081/api/categories/";
  private readonly updateURL = "http://127.0.0.1:8081/api/categories/update/";
  private readonly deleteURL = "http://127.0.0.1:8081/api/categories/delete/";
  private readonly addURL = "http://localhost:8081/api/categories/add";

  constructor(private http: HttpClient) {}

  getAllCat(): Observable<any[]> {
    return this.http.get<any>(this.allURL).pipe(
        map(res => res.categories)
    );
  }

  getCatById(id:number): Observable<any[]>{
    return this.http.get<any>(this.IdURL + id).pipe(
        map(res => res.category)
    );
  }

  updateCat(id:number, data:any){
    return this.http.put(this.updateURL + id, data);
  }

  deleteCat(id:number){
    return this.http.delete(this.deleteURL + id);
  }

  addCat(data:any){
    return this.http.post(this.addURL, data);
  }
}