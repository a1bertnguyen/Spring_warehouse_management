import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { supplierService } from "../service/supplierService";

@Component({
  selector: "supplier",
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./html/supplier.html",
  styleUrls: ["./css/supplier.css"],
})
export class Supplier {
  suppliers:any[] = [];

  role = localStorage.getItem('role');
  message = "";
  error = "";

  showAddItemForm = false;
  showEditSupplierForm = false;
  selectedSupplier: any = null;

  constructor(private supplierService:supplierService){}

  ngOnInit() {
        this.loadSuppliers();
    }

  loadSuppliers(){
    this.supplierService.getAllSuppliers().subscribe({
        next: model => {
        this.suppliers = model
      },
      error: () => {
        this.error = "",
        setTimeout(() => {
          this.error = "Failed to load suppliers"
        }, 500)
      }
    })
  }

  addItemForm = new FormGroup({
    name: new FormControl("", Validators.required),
    contactInfo: new FormControl("", Validators.required),
    address: new FormControl("", Validators.required),
  });

  editSupplierForm = new FormGroup({
    name: new FormControl("", Validators.required),
    contactInfo: new FormControl("", Validators.required),
    address: new FormControl("", Validators.required),
  });

  openAddItemForm() {
    this.message = "";
    this.error = "";
    this.addItemForm.reset();
    this.showAddItemForm = true;
  }

  closeAddItemForm() {
    this.showAddItemForm = false;
  }

  addItem() {
    this.message = "";
    this.error = "";

    if (this.addItemForm.invalid) {
      this.error = "All fields are required";
      return;
    }

    const name = this.addItemForm.value.name ?? "";
    const contactInfo = this.addItemForm.value.contactInfo ?? "";
    const address = this.addItemForm.value.address ?? "";

    const supplier ={
      name,
      contactInfo,
      address,
    };

    this.supplierService.addSupplier(supplier).subscribe({
        next: () =>{
            setTimeout(() => {this.message = "Supplier added successfully"}, 500);
            this.loadSuppliers();
        },
        error: (err) =>{
            setTimeout(() => {this.error = err.error?.message}, 500);
        }
    })

    this.closeAddItemForm();
  }

  deleteItem(id: any) {
    this.supplierService.deleteSupplier(id).subscribe({
        next: () =>{
            setTimeout(() => {this.message = "Supplier deleted successfully"}, 500);
            this.loadSuppliers();
        },
        error: (err) =>{
            setTimeout(() => {this.error = err.error?.message}, 500);
        }
    })
  }

  openEditSupplierModal(supplier: any) {
    this.message = "";
    this.error = "";
    this.selectedSupplier = supplier;
    this.showEditSupplierForm = true;

    this.editSupplierForm.patchValue({
      name: supplier.name,
      contactInfo: supplier.contactInfo,
      address: supplier.address,
    });
  }

  closeEditModal() {
    this.showEditSupplierForm = false;
    this.selectedSupplier = null;
  }

  editSupplier(id: number) {
    if (this.editSupplierForm.invalid) {
      this.error = "All fields are required";
      return;
    }

    const supplier = {
        name:this.editSupplierForm.value.name,
        contactInfo:this.editSupplierForm.value.contactInfo,
        address:this.editSupplierForm.value.address
    }

    this.supplierService.addSupplier(id).subscribe({
        next: () =>{
            setTimeout(() => {this.message = "Supplier added successfully"}, 500);
            this.loadSuppliers();
        },
        error: (err) =>{
            setTimeout(() => {this.error = err.error?.message}, 500);
        }
    })

    this.closeEditModal();
  }
}