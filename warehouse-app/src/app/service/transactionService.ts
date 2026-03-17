import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class transactionService {

  private readonly allURL = "http://127.0.0.1:8081/api/transactions/all";
  private readonly idURL = "http://127.0.0.1:8081/api/transactions/";
  private readonly updateURL = "http://127.0.0.1:8081/api//transactions/return";
  private readonly purchaseURL = "http://127.0.0.1:8081/api/transactions/purchase";
  private readonly sellURL = "http://localhost:8081/api/transactions/sell";
  private readonly searchURL = "http://localhost:8081/api/transactions/by-month-year?";

  constructor(private http: HttpClient) {}

  getAllTran(): Observable<any[]> {
    return this.http.get<any>(this.allURL).pipe(
        map(res => res.transactions)
    );
  }

  getTranById(id:string): Observable<any[]>{
    return this.http.get<any>(this.idURL + id).pipe(
        map(res => res.transaction)
    );
  }

  returnTran(data:any){
    return this.http.post(this.updateURL, data);
  }

  purchaseTran(data:any){
    return this.http.post(this.purchaseURL, data);
  }

  sellTran(data:any){
    return this.http.post(this.sellURL, data);
  }

  searchTran(month:number, year:number): Observable<any[]>{
    return this.http.get<any>(this.searchURL + "month=" + month + "&year=" + year).pipe(
        map(res => res.transactions)
    );
  }

  updateStatusTran(id:number, status:string){
    return this.http.put(
    this.idURL + id,
    `"${status}"`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  }
}