import { Component } from "@angular/core";
import { StatChartComponent } from "./stat-chart";

import { userService } from "../service/userService";
import { productService } from "../service/productService";
import { categoryService } from "../service/categoryService";
import { supplierService } from "../service/supplierService";
import { taskService } from "../service/taskService";
import { transactionService } from "../service/transactionService";

import { CommonModule } from "@angular/common";

@Component({
    templateUrl: './html/statistic.html',
    imports: [StatChartComponent, CommonModule],
    styleUrls: ['./css/statistic.css']
})

export class Statistic {
    users:any[] = [];
    transactions:any[] = [];
    products:any[] = [];
    categories:any[] = [];
    suppliers:any[] = [];
    tasks:any[] = [];

    message = "";
    error = "";
    
    constructor(private userService:userService,
                private transactionService:transactionService,
                private productService:productService,
                private categoryService:categoryService,
                private taskService:taskService,
                private supplierService:supplierService
    ) {}

    ngOnInit() {
        this.loadUsers();
        this.loadSuppliers();
        this.loadTransactions();
        this.loadTasks();
        this.loadCategories();
        this.loadProducts();
    }

    loadUsers(){
        this.userService.getAllUser().subscribe({
            next: model => this.users = model,
            error: () => this.error = "Failed to load users"
        });
    }
    loadSuppliers(){
        this.supplierService.getAllSuppliers().subscribe({
            next: model => this.suppliers = model,
            error: () => this.error = "Failed to load suppliers"
        });
    }
    loadTransactions(){
        this.transactionService.getAllTran().subscribe({
            next: model => this.transactions = model,
            error: () => this.error = "Failed to load transaction"
        });
    }
    loadTasks(){
        this.taskService.getAllAdminTask().subscribe({
            next: model => this.tasks = model,
            error: () => this.error = "Failed to load tasks"
        });
    }
    loadCategories(){
        this.categoryService.getAllCat().subscribe({
            next: model => this.categories = model,
            error: () => this.error = "Failed to load categorys"
        });
    }
    loadProducts(){
        this.productService.getAllProducts().subscribe({
            next: model => this.products = model,
            error: () => this.error = "Failed to load products"
        });
    }

    getUserNumber(){
        return this.users.length;
    }

    getSupplierNumber(){
        return this.suppliers.length;
    }

    getSellingOrder(){
        const selling = this.transactions.filter(t => t.transaction_type = "SALE");
        return selling.length;
    }

    getPurchasingOrder(){
        const purchasing = this.transactions.filter(t => t.transaction_type = "PURCHASE");
        return purchasing.length;
    }

    getTaskNumber(){
        return this.tasks.length;
    }

    getCategoryNumber(){
        return this.categories.length;
    }

    getProductNumber(){
        return this.products.length;
    }

    getOutStock(){
        const outStock = this.products.filter(p => p.stock_quantity <= 0);
        return outStock.length;
    }
}