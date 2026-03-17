import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { taskService } from '../service/taskService';

@Component({
  selector: 'app-warehouse-manager',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './html/warehouse-manager.html',
  styleUrl: '../css/dashBoard.css'
})
export class WarehouseManager implements OnInit {

  userId: number = Number(localStorage.getItem('userId'));
  hasAssignedTasks: boolean = false;

  constructor(private taskService: taskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getAllManagerTask(this.userId).subscribe({
      next: (res) => {
        this.hasAssignedTasks = res.some(t => t.status === 'ASSIGNED');
      },
      error: (err) => {
        console.error("Failed to load tasks", err);
      }
    });
  }
}
