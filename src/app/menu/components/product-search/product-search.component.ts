import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss'],
})
export class ProductSearchComponent implements OnInit, OnDestroy {
  @Output() filter: EventEmitter<string> = new EventEmitter<string>();
  destroy$ = new Subject<void>();
  searchInput = new FormControl('');

  constructor(private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((str) => {
        if (str !== null) this.filter.emit(str);
      });

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const query = params.get('query');

        if (!query) return;

        this.searchInput.patchValue(query);
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
