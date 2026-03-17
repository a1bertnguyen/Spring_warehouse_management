import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { PRODUCTS } from "../data";

@Component({
    imports:[ReactiveFormsModule, CommonModule],
    templateUrl: './html/inventory.html',
    styleUrls:['./css/inventory.css']
})

export class Inventory {
    products = this.sortProductsByQuantity(PRODUCTS);

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
        return products.sort((a, b) => {
            return a.stock_quantity - b.stock_quantity;
        });
    }
}