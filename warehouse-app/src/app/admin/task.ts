import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { taskService } from "../service/taskService";
import { productService } from "../service/productService";
import { userService } from "../service/userService";

@Component({
  selector: "task",
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: "./html/task.html",
  styleUrls: ["./css/task.css"]
})
export class TaskComponent {

  message = "";
  error = "";

  tasks: any[] = [];
  users: any[] = [];
  products: any[] = [];

  role = localStorage.getItem("role");
  userId = Number(localStorage.getItem("userId")); 

  showAddTaskForm = false;
  showEditTaskForm = false;
  selectedTask: any = null;

  constructor(
    private taskService: taskService,
    private productService: productService,
    private userService: userService
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.loadUsers();
    this.loadProducts();
  }

  loadTasks() {
    if (this.role === "ADMIN") {
      this.taskService.getAllAdminTask().subscribe({
        next: (res) => (this.tasks = res),
        error: () => (this.error = "Failed to load tasks"),
      });
    } else {
      this.taskService.getAllManagerTask(this.userId).subscribe({
        next: (res) => (this.tasks = res),
        error: () => (this.error = "Failed to load tasks"),
      });
    }
  }

  loadUsers() {
    if (this.role === "ADMIN")
    this.userService.getAllUser().subscribe({
      next: (res) => (this.users = res.filter(u => u.role === 'MANAGER')),
      error: () => (this.error = "Failed to load users"),
    });
  }

  loadProducts() {
    if (this.role === "ADMIN")
    this.productService.getAllProducts().subscribe({
      next: (res) => (this.products = res),
      error: () => (this.error = "Failed to load products"),
    });
  }

  searchForm = new FormGroup({
    searchInput: new FormControl("")
  });

  onSearchSubmit() {
    const input = this.searchForm.value.searchInput?.trim() || "";

    if (input === "") {
      this.loadTasks();
      return;
    }

    this.taskService.searchTask(input).subscribe({
      next: (res) => (this.tasks = res),
      error: () => (this.error = "Search failed or product not found"),
    });
  }

  statusColor(status: string) {
    switch (status) {
      case "ASSIGNED": return "#3b82f6";
      case "IN_PROGRESS": return "#eab308";
      case "COMPLETED": return "#10b981";
      default: return "#d1d5db";
    }
  }

  addTaskForm = new FormGroup({
    name: new FormControl("", Validators.required),
    description: new FormControl("", Validators.required),
    userId: new FormControl<number | null>(null, Validators.required),
    productId: new FormControl<number | null>(null, Validators.required),
    deadline: new FormControl("", Validators.required)
  });

  openAddTaskForm() {
    this.showAddTaskForm = true;
    this.addTaskForm.reset();
  }

  closeAddTaskForm() {
    this.showAddTaskForm = false;
  }

  addTask() {
    if (this.addTaskForm.invalid) {
      this.error = "All fields required";
      return;
    }

    this.taskService.addTask(this.addTaskForm.value).subscribe({
      next: () => {
        this.message = "Task created successfully";
        this.loadTasks();
        this.closeAddTaskForm();
      },
      error: () => (this.error = "Failed to add task"),
    });
  }

  editTaskForm = new FormGroup({
    name: new FormControl("", Validators.required),
    description: new FormControl("", Validators.required),
    userId: new FormControl<number | null>(null, Validators.required),
    productId: new FormControl<number | null>(null, Validators.required),
    deadline: new FormControl("", Validators.required)
  });

  openEditTaskModal(t: any) {
    this.selectedTask = t;

    this.editTaskForm.patchValue({
      name: t.name,
      description: t.description,
      userId: t.userId,
      productId: t.productId,
      deadline: t.deadline?.replace(" ", "T") || ""
    });

    this.showEditTaskForm = true;
  }

  closeEditTaskForm() {
    this.showEditTaskForm = false;
    this.selectedTask = null;
  }

  editTask(id: number) {
    if (this.editTaskForm.invalid) {
      this.error = "All fields required";
      return;
    }

    this.taskService.updateTask(id, this.editTaskForm.value).subscribe({
      next: () => {
        this.message = "Task updated!";
        this.loadTasks();
        this.closeEditTaskForm();
      },
      error: () => (this.error = "Failed to update task"),
    });
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.message = "Task deleted";
        this.loadTasks();
      },
      error: () => (this.error = "Failed to delete task"),
    });
  }

  updateStatus(id: number, status: string) {
    this.taskService.updateTaskStatus(id, status).subscribe({
      next: () => {
        this.message = "Status updated";
        this.loadTasks();
      },
      error: () => (this.error = "Failed to update status"),
    });
  }

  addRandomTask() {
  this.taskService.getRngTask().subscribe({
    next: (res: any) => {
      this.message = "Random Task Added Successfully!";
      this.loadTasks();
    },
    error: (err) => {
      console.error(err);
      this.error = "Failed to generate random task.";
    }
  });
}
}
