import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class productService {

  private readonly allURL = "http://127.0.0.1:8081/api/products/all";
  private readonly IdURL = "http://127.0.0.1:8081/api/products/";
  private readonly updateURL = "http://127.0.0.1:8081/api/products/update";
  private readonly deleteURL = "http://127.0.0.1:8081/api/products/delete/";
  private readonly addURL = "http://localhost:8081/api/products/add";
  private readonly searchURL = "http://localhost:8081/api/products/search?input=";

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<any[]> {
    return this.http.get<any>(this.allURL).pipe(
        map(res => res.products)
    );
  }

  getProductById(id:number): Observable<any[]>{
    return this.http.get<any>(this.IdURL + id).pipe(
        map(res => res.product)
    );
  }

  updateProduct(data:any){
    return this.http.put(this.updateURL, data);
  }

  deleteProduct(id:number){
    return this.http.delete(this.deleteURL + id);
  }

  addProduct(data:any){
    return this.http.post(this.addURL, data);
  }

  searchProduct(input:any): Observable<any[]>{
    return this.http.get<any>(this.searchURL + input).pipe(
        map(res => res.products)
    );
  }
}