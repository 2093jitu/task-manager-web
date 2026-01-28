import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Task, TaskStatus, TaskPriority, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.model';
import { Api } from '../../services/api';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
  ,providers: [provideNativeDateAdapter()]
})
export class TaskFormComponent implements OnInit, OnDestroy {
  task: Task | null = null;
  isEditMode = false;

  taskForm: FormGroup;
  taskStatuses = Object.values(TaskStatus);
  taskPriorities = Object.values(TaskPriority);
  private destroy$ = new Subject<void>();
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task | null; isEditMode: boolean }
  ) {
    this.taskForm = this.createForm();
  }

  ngOnInit(): void {
    this.task = this.data?.task ?? null;
    this.isEditMode = !!this.data?.isEditMode;
    if (this.task && this.isEditMode) {
      this.populateForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      status: [TaskStatus.PENDING, Validators.required],
      priority: [TaskPriority.MEDIUM, Validators.required],
      dueDate: [null, Validators.required]
    });
  }

  private populateForm(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        status: this.task.status,
        priority: this.task.priority,
        dueDate: new Date(this.task.dueDate)
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const dueDate = new Date(formValue.dueDate).toISOString();

      if (this.isEditMode && this.task?.id) {
        this.updateTask(formValue, dueDate);
      } else {
        this.createTask(formValue, dueDate);
      }
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  private createTask(formValue: any, dueDate: string): void {
    const createRequest: CreateTaskRequest = {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      priority: formValue.priority,
      dueDate: dueDate
    };

    this.submitting = true;
    this.api.createTask(createRequest)
      .pipe(takeUntil(this.destroy$))
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (task) => {
          this.snackBar.open('Task created successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.dialogRef.close(task);
        },
        error: (error) => {
          this.snackBar.open(`Error creating task: ${error.message}`, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      });
  }

  private updateTask(formValue: any, dueDate: string): void {
    if (!this.task?.id) return;

    const updateRequest: UpdateTaskRequest = {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      priority: formValue.priority,
      dueDate: dueDate
    };

    this.submitting = true;
    this.api.updateTask(this.task.id, updateRequest)
      .pipe(takeUntil(this.destroy$))
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (task) => {
          this.snackBar.open('Task updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.dialogRef.close(task);
        },
        error: (error) => {
          this.snackBar.open(`Error updating task: ${error.message}`, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  private resetForm(): void {
    this.taskForm.reset();
    this.taskForm.patchValue({
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }
}
