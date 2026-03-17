import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location, DatePipe, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { taskService } from '../service/taskService';

@Component({
  selector: 'app-task-details',
  imports: [DatePipe, RouterModule, CommonModule],
  templateUrl: './html/task-details.html',
  styleUrls: ['./css/task-details.css']
})
export class TaskDetailsComponent implements OnInit {

  task: any = null;
  message: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private taskService: taskService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTask(+id);
    }
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (res) => {
        this.task = res;
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.error = 'Failed to load task details.';
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
