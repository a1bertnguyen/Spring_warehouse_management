import { Component} from "@angular/core";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { OnInit } from "@angular/core";
import { DatePipe, CommonModule, Location } from "@angular/common";

import { transactionService } from "../service/transactionService";

@Component ({
    imports: [RouterModule, DatePipe, CommonModule],
    templateUrl:"./html/transaction-details.html",
    styleUrls:["./css/transaction-details.css"]
})

export class transactionDetail implements OnInit {

  transaction: any = null;
  message = "";
  status = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: transactionService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTransaction(id);
    }
  }

  goBack() {
    this.location.back();
  }

  loadTransaction(id: string) {
    this.transactionService.getTranById(id).subscribe({
      next: (res) => {
          this.transaction = res;
          this.status = this.transaction.status;
      },
      error: (e) => this.showMessage(e.error?.message || "Failed to load transaction")
    });
  }

  showMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = ""), 4000);
  }
}