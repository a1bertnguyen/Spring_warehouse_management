import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

import { transactionService } from "../service/transactionService";
import { supplierService } from "../service/supplierService";
import { productService } from "../service/productService";

@Component({
  selector: "transaction",
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: "./html/transaction.html",
  styleUrls: ["./css/transaction.css"],
})
export class Transaction {
  route: ActivatedRoute = inject(ActivatedRoute);

  constructor(private tranService: transactionService,
              private supplierService: supplierService,
              private productService: productService
  ) {}

  role = localStorage.getItem("role");
  transaction_type: string | null = null;
  backendType: "SALE" | "PURCHASE" | null = null;
  selectedTranId:number | null = null;

  transactions: any[] = [];
  products: any[] = [];
  suppliers: any[] = [];

  message = "";
  error = "";

  showPurchaseForm = false;
  showSellForm = false;
  showReturnForm = false;

  purchaseForm = new FormGroup({
    productId: new FormControl<number | null>(null, Validators.required),
    supplierId: new FormControl<number | null>(null, Validators.required),
    quantity: new FormControl<number | null>(null, [Validators.required]),
    description: new FormControl<string | null>(""),
    note: new FormControl<string | null>(""),
  });

  sellForm = new FormGroup({
    productId: new FormControl<number | null>(null, Validators.required),
    quantity: new FormControl<number | null>(null, [Validators.required]),
    description: new FormControl<string | null>(""),
    note: new FormControl<string | null>(""),
  });

  returnForm = new FormGroup({
    productId: new FormControl<number | null>(null, Validators.required),
    supplierId: new FormControl<number | null>(null, Validators.required),
    quantity: new FormControl<number | null>(null, [Validators.required]),
    description: new FormControl<string | null>(""),
    note: new FormControl<string | null>(""),
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.transaction_type = params.get("type");

      if (this.transaction_type === "Selling") {
        this.backendType = "SALE";
      } else if (this.transaction_type === "Purchasing") {
        this.backendType = "PURCHASE";
      } else {
        this.backendType = null;
      }

      this.loadTransactions();
    });
  this.loadProducts();
  this.loadSuppliers();
  }

  loadTransactions() {
    this.message = "";
    this.error = "";

    this.tranService.getAllTran().subscribe({
      next: (list) => {
        if (this.backendType) {
          this.transactions = list.filter((t) => t.transactionType === this.backendType);
        } else {
          this.transactions = list;
        }
      },
      error: () => {
        setTimeout(() => {
          this.error = "Failed to load transactions";
        }, 500);
      },
    });
  }


  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (p) => this.products = p,
      error: () => this.error = "Failed to load products"
    });
  }

  loadSuppliers() {
    this.supplierService.getAllSuppliers().subscribe({
      next: (s) => this.suppliers = s,
      error: () => this.error = "Failed to load suppliers"
    });
  }

  updateStatus(id: number, status: string) {
    this.message = "";
    this.error = "";

    this.tranService.updateStatusTran(id, status).subscribe({
      next: () => {
        setTimeout(() => {
          this.message = "Transaction status updated successfully";
        }, 500);
        this.loadTransactions();
      },
      error: (err) => {
        setTimeout(() => {
          this.error = err.error?.message || "Failed to update status";
        }, 500);
      },
    });
  }

  openPurchaseForm() {
    this.message = "";
    this.error = "";
    this.purchaseForm.reset();
    this.showPurchaseForm = true;
  }

  openSellForm() {
    this.message = "";
    this.error = "";
    this.sellForm.reset();
    this.showSellForm = true;
  }

  openReturnForm(id:number) {
    this.message = "";
    this.error = "";
    this.selectedTranId = id;
    this.returnForm.reset();
    this.showReturnForm = true;
  }

  closePurchaseForm() {
    this.showPurchaseForm = false;
  }

  closeSellForm() {
    this.showSellForm = false;
  }

  closeReturnForm() {
    this.showReturnForm = false;
    this.selectedTranId = null;
  }

  addPurchase() {
    this.message = "";
    this.error = "";

    if (this.purchaseForm.invalid) {
      this.error = "All fields with * are required";
      return;
    }

    const data = {
      productId: this.purchaseForm.value.productId,
      supplierId: this.purchaseForm.value.supplierId,
      quantity: this.purchaseForm.value.quantity,
      description: this.purchaseForm.value.description,
      note: this.purchaseForm.value.note,
    };

    this.tranService.purchaseTran(data).subscribe({
      next: () => {
        setTimeout(() => {
          this.message = "Purchase transaction created successfully";
        }, 500);
        this.loadTransactions();
      },
      error: (err) => {
        setTimeout(() => {
          this.error = err.error?.message || "Failed to create purchase transaction";
        }, 500);
      },
    });

    this.closePurchaseForm();
  }

  addSell() {
    this.message = "";
    this.error = "";

    if (this.sellForm.invalid) {
      this.error = "All fields with * are required";
      return;
    }

    const data = {
      productId: this.sellForm.value.productId,
      quantity: this.sellForm.value.quantity,
      description: this.sellForm.value.description,
      note: this.sellForm.value.note,
    };

    this.tranService.sellTran(data).subscribe({
      next: () => {
        setTimeout(() => {
          this.message = "Sell transaction created successfully";
        }, 500);
        this.loadTransactions();
      },
      error: (err) => {
        setTimeout(() => {
          this.error = err.error?.message || "Failed to create sell transaction";
        }, 500);
      },
    });

    this.closeSellForm();
  }

  returnTran(id:number | null) {
    this.message = "";
    this.error = "";

    if (this.returnForm.invalid) {
      this.error = "All fields with * are required";
      return;
    }

    const data = {
      productId: this.returnForm.value.productId,
      supplierId: this.purchaseForm.value.supplierId,
      quantity: this.returnForm.value.quantity,
      description: this.returnForm.value.description,
      note: this.returnForm.value.note,
    };

    this.tranService.returnTran(data).subscribe({
      next: () => {
        setTimeout(() => {
          this.message = "Return transaction created successfully";
        }, 500);
        if (id) this.updateStatus(id, 'CANCELLED');
        this.loadTransactions();
      },
      error: (err) => {
        setTimeout(() => {
          this.error = err.error?.message || "Failed to create return transaction";
        }, 500);
      },
    });

    this.closeReturnForm();
  }

  searchForm = new FormGroup({
    month: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(12)]),
    year: new FormControl<number | null>(null, [Validators.required, Validators.min(2000)]),
  });

  onSearchSubmit() {
    if (this.searchForm.invalid) {
      this.error = "Please enter valid month and year";
      return;
    }

    const month = this.searchForm.value.month ?? 0;
    const year = this.searchForm.value.year ?? 0;

    this.search(month, year);
  }

  search(month: number, year: number) {
    this.message = "";
    this.error = "";

    this.tranService.searchTran(month, year).subscribe({
      next: (list) => {
        if (this.backendType) {
          this.transactions = list.filter((t) => t.transactionType === this.backendType);
        } else {
          this.transactions = list;
        }
      },
      error: () => {
        setTimeout(() => {
          this.error = "Failed to search transactions";
        }, 500);
      },
    });
  }
}
