import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class supplierService {

  private readonly allURL = "http://127.0.0.1:8081/api/suppliers/all";
  private readonly IdURL = "http://127.0.0.1:8081/api/suppliers/";
  private readonly updateURL = "http://127.0.0.1:8081/api/suppliers/update/";
  private readonly deleteURL = "http://127.0.0.1:8081/api/suppliers/delete/";
  private readonly addURL = "http://localhost:8081/api/suppliers/add";

  constructor(private http: HttpClient) {}

  getAllSuppliers(): Observable<any[]> {
    return this.http.get<any>(this.allURL).pipe(
        map(res => res.suppliers)
    );
  }

  getSupplierById(id:number): Observable<any[]>{
    return this.http.get<any>(this.IdURL + id).pipe(
        map(res => res.supplier)
    );
  }

  updateSupplier(id:number, data:any){
    return this.http.put(this.updateURL + id, data);
  }

  deleteSupplier(id:number){
    return this.http.delete(this.deleteURL + id);
  }

  addSupplier(data:any){
    return this.http.post(this.addURL, data);
  }
}