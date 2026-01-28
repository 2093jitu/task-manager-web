import { Component, signal, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { TaskListComponent } from './components/task-list/task-list.component';
import { Task } from './models/task.model';
import { Api } from './services/api';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatSnackBarModule,
    TaskListComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Task Manager');
  showForm = false;
  private destroy$ = new Subject<void>();
  @ViewChild(TaskListComponent) taskList?: TaskListComponent;

  constructor(
    private api: Api,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initialize any required setup
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTaskSaved(task: Task): void {
    this.showForm = false;
    this.snackBar.open('Task saved successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  onFormCancelled(): void {
    this.showForm = false;
  }

  onTaskDeleted(taskId: number): void {
    this.snackBar.open('Task deleted successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  toggleForm(): void {
    this.taskList?.openCreateDialog();
  }
}
