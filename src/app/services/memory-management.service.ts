import { Injectable, OnDestroy, Component } from '@angular/core';
import { Subject, Observable, takeUntil } from 'rxjs';

/**
 * Service to help manage memory leaks by providing a centralized way to handle subscriptions
 * and cleanup in components and services.
 */
@Injectable({
  providedIn: 'root'
})
export class MemoryManagementService implements OnDestroy {
  private destroy$ = new Subject<void>();

  /**
   * Returns a takeUntil operator that will complete when the service is destroyed
   * Use this in your components/services to automatically unsubscribe
   */
  get takeUntilDestroy(): <T>(source: Observable<T>) => Observable<T> {
    return <T>(source: Observable<T>) => source.pipe(takeUntil(this.destroy$));
  }

  /**
   * Manually trigger cleanup (useful for testing or manual cleanup)
   */
  cleanup(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}

/**
 * Base class for components that need memory management
 * Extend this class to get automatic subscription management
 */
@Component({
  template: ''
})
export abstract class BaseComponent {
  protected destroy$ = new Subject<void>();

  /**
   * Use this method to wrap your observables to prevent memory leaks
   */
  protected takeUntilDestroy<T>(source: Observable<T>): Observable<T> {
    return source.pipe(takeUntil(this.destroy$));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Base class for services that need memory management
 * Extend this class to get automatic subscription management
 */
@Injectable()
export abstract class BaseService {
  protected destroy$ = new Subject<void>();

  /**
   * Use this method to wrap your observables to prevent memory leaks
   */
  protected takeUntilDestroy<T>(source: Observable<T>): Observable<T> {
    return source.pipe(takeUntil(this.destroy$));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
