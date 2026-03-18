import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { productService } from "../service/productService";

@Component({
    imports:[ReactiveFormsModule, CommonModule],
    templateUrl: './html/inventory.html',
    styleUrls:['./css/inventory.css']
})

export class Inventory {
    products: any[] = [];
    error = "";

    constructor(private productService: productService) {}

    ngOnInit() {
        this.loadInventory();
    }

    loadInventory() {
        this.productService.getAllProducts().subscribe({
            next: (products) => {
                this.products = this.sortProductsByQuantity(products);
            },
            error: () => {
                this.error = "Failed to load inventory";
            }
        });
    }

    getQuantity(quantity: number){
        if (quantity <= 0) return "#b91c1c";
        if (quantity <= 15) return "#dc9326ff";
        return "#F3F4F5";
    }

    getQuantityTag(quantity: number){
        if (quantity <= 0) return "Out of stocks";
        if (quantity <= 15) return "Few of stocks";
        return "Normal";
    }

    getTotalPrice(quantity:number, price:number){
        return quantity * price;
    }

    sortProductsByQuantity(products: any[]) {
        return [...products].sort((a, b) => {
            return a.stockQuantity - b.stockQuantity;
        });
    }
}
