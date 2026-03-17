import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { categoryService } from "../service/categoryService";

@Component({
  selector: "category",
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./html/category.html",
  styleUrls: ["./css/category.css"],
})
export class Category {
  categories: any[] = [];

  role = localStorage.getItem('role');
  message = "";
  error = "";

  showAddCategoryForm = false;
  showEditCategoryForm = false;
  selectedCategory: any = null;

  constructor(private categoryService: categoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAllCat().subscribe({
      next: (model) => {
        this.categories = model;
      },
      error: () => {
        this.error = "";
        setTimeout(() => {
          this.error = "Failed to load categories";
        }, 500);
      },
    });
  }

  // ADD CATEGORY FORM
  addCategoryForm = new FormGroup({
    name: new FormControl("", Validators.required),
  });

  openAddCategoryForm() {
    this.message = "";
    this.error = "";
    this.addCategoryForm.reset();
    this.showAddCategoryForm = true;
  }

  closeAddCategoryForm() {
    this.showAddCategoryForm = false;
  }

  addCategory() {
    this.message = "";
    this.error = "";

    if (this.addCategoryForm.invalid) {
      this.error = "Name is required";
      return;
    }

    const name = this.addCategoryForm.value.name ?? "";

    const category = { name };

    this.categoryService.addCat(category).subscribe({
      next: () => {
        setTimeout(() => {
          this.message = "Category added successfully";
        }, 500);
        this.loadCategories();
      },
      error: (err) => {
        setTimeout(() => {
          this.error = err.error?.message;
        }, 500);
      },
    });

    this.closeAddCategoryForm();
  }

  // DELETE
  deleteCategory(id: any) {
    this.categoryService.deleteCat(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.message = "Category deleted successfully";
        }, 500);
        this.loadCategories();
      },
      error: (err) => {
        setTimeout(() => {
          this.error = err.error?.message;
        }, 500);
      },
    });
  }

  // EDIT CATEGORY
  editCategoryForm = new FormGroup({
    name: new FormControl("", Validators.required),
  });

  openEditCategoryModal(category: any) {
    this.message = "";
    this.error = "";
    this.selectedCategory = category;
    this.showEditCategoryForm = true;

    this.editCategoryForm.patchValue({
      name: category.name,
    });
  }

  closeEditModal() {
    this.showEditCategoryForm = false;
    this.selectedCategory = null;
  }

  editCategory(id: any) {
    if (this.editCategoryForm.invalid) {
      this.error = "Name is required";
      return;
    }

    const updated = {
      name: this.editCategoryForm.value.name,
    };

    this.categoryService.updateCat(id, updated).subscribe({
      next: () => {
        setTimeout(() => {
          this.message = "Category updated successfully";
        }, 500);
        this.loadCategories();
      },
      error: (err) => {
        setTimeout(() => {
          this.error = err.error?.message;
        }, 500);
      },
    });

    this.closeEditModal();
  }
}
