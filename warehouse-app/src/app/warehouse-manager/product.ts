import { Component} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs";

import { productService } from "../service/productService";
import { categoryService } from "../service/categoryService";

@Component({
  selector: "product",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./html/product.html",
  styleUrls: ["./css/product.css"],
})
export class Product {

  products: any[] = [];
  categories: any[] = [];

  message = "";
  error = "";
  role = localStorage.getItem("role");

  showAddForm = false;
  showEditForm = false;

  selectedProduct: any = null;
  selectedFile?: File | null = null;
  previewImage: string | null = null;

  constructor(private productService:productService,
            private categoryService:categoryService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (p) => {
        this.products = p;
        this.filteredProducts = this.products.sort((a: any, b: any) => {
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        });
      },
      error: () => (this.error = "Failed to load products"),
    });
  }

  loadCategories() {
    this.categoryService.getAllCat().subscribe({
      next: (c) => (this.categories = c),
      error: () => (this.error = "Failed to load categories"),
    });
  }

  filteredProducts: any[] = [];

  searchControl = new FormControl("");

  searchForm = new FormGroup({
    keyword: this.searchControl
  });

  onSearch() {
    const keyword = this.searchControl.value?.trim() || "";

    if (keyword === "") {
      this.filteredProducts = this.products;
      return;
    }

    this.searchBackend(keyword);
  }

  searchBackend(keyword: string) {
    this.productService.searchProduct(keyword).subscribe({
      next: (res) => {
        this.filteredProducts = res;
      },
      error: () => {
        this.error = "Search failed";
        this.filteredProducts = this.products;
      }
    });
  }

  addForm = new FormGroup({
    name: new FormControl("", Validators.required),
    sku: new FormControl("", Validators.required),
    price: new FormControl<number | null>(null, Validators.required),
    stockQuantity: new FormControl<number | null>(null, Validators.required),
    categoryId: new FormControl<number | null>(null, Validators.required),
    expiryDate: new FormControl("", Validators.required),
    description: new FormControl(""),
  });

  openAddForm() {
    this.showAddForm = true;
    this.previewImage = null;
    this.selectedFile = null;
    this.addForm.reset();
  }

  closeAddForm() {
    this.showAddForm = false;
  }

  onFileSelected(event: Event, add: boolean) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => (this.previewImage = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  addProduct() {
    if (this.addForm.invalid || !this.selectedFile) {
      this.error = "All fields and image are required";
      return;
    }

    const formData = new FormData();

    Object.entries(this.addForm.value).forEach(([key, value]) => {
      if (value !== null && key !== "expiryDate") {
        formData.append(key, value.toString());
      }
    });
  
    const exp = this.addForm.value.expiryDate + "T00:00:00";
    formData.append("expiryDate", exp);

    formData.append("imageFile", this.selectedFile);
  
    this.productService.addProduct(formData).subscribe({
      next: () => {
        this.message = "Product created successfully";
        this.loadProducts();
        this.closeAddForm();
      },
      error: () => (this.error = "Failed to add product"),
    });
  }

  editForm = new FormGroup({
    productId: new FormControl ("", Validators.required),
    name: new FormControl("", Validators.required),
    sku: new FormControl("", Validators.required),
    price: new FormControl<number | null>(null, Validators.required),
    stockQuantity: new FormControl<number | null>(null, Validators.required),
    categoryId: new FormControl<number | null>(null, Validators.required),
    expiryDate: new FormControl("", Validators.required),
    description: new FormControl(""),
  });

  openEditForm(p: any) {
    this.selectedProduct = p;
    this.previewImage = null;
    this.selectedFile = null;

    this.editForm.patchValue({
      productId: p.productId,
      name: p.name,
      sku: p.sku,
      price: p.price,
      stockQuantity: p.stockQuantity,
      categoryId: p.categoryId,
      expiryDate: p.expiryDate.split("T")[0],
      description: p.description,
    });

    this.showEditForm = true;
  }

  closeEditForm() {
    this.showEditForm = false;
    this.selectedProduct = null;
    this.previewImage = null;
    this.selectedFile = null;
  }

  updateProduct(id: number) {
    if (this.editForm.invalid  || !this.selectedFile) {
      this.error = "All required fields must be filled";
      return;
    }

    const formData = new FormData();

    Object.entries(this.editForm.value).forEach(([key, value]) => {
        if (value !== null && key !== "expiryDate") {
          formData.append(key, value.toString());
        }
      });
  
      const exp = this.addForm.value.expiryDate + "T00:00:00";
      formData.append("expiryDate", exp);

      formData.append("imageFile", this.selectedFile);

    this.productService.updateProduct(formData).subscribe({
      next: () => {
        this.message = "Product updated!";
        this.loadProducts();
        this.closeEditForm();
      },
      error: () => (this.error = "Failed to update product"),
    });
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.message = "Deleted successfully";
        this.loadProducts();
      },
      error: () => (this.error = "Failed to delete product"),
    });
  }

  getExpiringSoon(date: string) {
    const today = new Date();
    const expire = new Date(date);
    const diff = (expire.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diff <= 0) return "#b91c1c";
    if (diff <= 7) return "#dc9326ff";
    if (diff <= 15) return "#f4f461ff";
    return "#F3F4F5";
  }
}
