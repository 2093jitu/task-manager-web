import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, Subject } from 'rxjs';
import { catchError, tap, finalize, takeUntil } from 'rxjs/operators';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';
import { ErrorHandlingService } from './error-handling.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Api implements OnDestroy {
  private readonly baseUrl = `${environment.apiUrl}/task`;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private destroy$ = new Subject<void>();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandling: ErrorHandlingService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loadingSubject.complete();
  }

  // Create a new task
  createTask(task: CreateTaskRequest): Observable<Task> {
    this.loadingSubject.next(true);
    return this.http.post<Task>(`${this.baseUrl}/create`, task).pipe(
      takeUntil(this.destroy$),
      tap(() => console.log('Task created successfully')),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // Get all tasks
  getAllTasks(): Observable<Task[]> {
    this.loadingSubject.next(true);
    return this.http.get<Task[]>(`${this.baseUrl}/all`).pipe(
      takeUntil(this.destroy$),
      tap(() => console.log('Tasks fetched successfully')),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // Get a single task by ID
  getTaskById(id: number): Observable<Task> {
    this.loadingSubject.next(true);
    return this.http.get<Task>(`${this.baseUrl}/${id}`).pipe(
      takeUntil(this.destroy$),
      tap(() => console.log(`Task ${id} fetched successfully`)),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // Update a task
  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    this.loadingSubject.next(true);
    return this.http.put<Task>(`${this.baseUrl}/update/${id}`, task).pipe(
      takeUntil(this.destroy$),
      tap(() => console.log(`Task ${id} updated successfully`)),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // Delete a task
  deleteTask(id: number): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`).pipe(
      takeUntil(this.destroy$),
      tap(() => console.log(`Task ${id} deleted successfully`)),
      catchError(this.handleError),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // Error handling
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    return this.errorHandling.handleHttpError(error);
  }
}
