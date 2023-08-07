import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, map, Observable, Subject, takeUntil } from 'rxjs';
import { CategoryInterface } from '@src/app/core/types';
import { DataService } from '@src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { selectCategories } from '@src/app/menu/store/selectors';
import { Store } from '@ngrx/store';
import * as MenuActions from '@src/app/menu/store/actions';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
})
export class CategoryFilterComponent implements OnInit, OnDestroy {
  @Input() isAdmin!: boolean;
  @Output() productFilters: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();

  public storeCategories$: Observable<CategoryInterface[]> =
    this.store.select(selectCategories);
  public formCategories!: FormGroup;
  public isEditing = false;
  public isEdit = false;
  private destroy$ = new Subject<void>();
  private updateDestroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private route: ActivatedRoute,
    private store: Store
  ) {}

  private createFormCategory(categories: CategoryInterface[]) {
    return categories.reduce(
      (acc, category) => {
        acc[category.id.toString()] = false;
        return acc;
      },
      {} as {
        [key: string]: boolean;
      }
    );
  }

  public clearCategories(): void {
    this.formCategories.reset();
  }

  public toggleEditing(): void {
    this.isEditing = !this.isEditing;
  }

  private setUpdateSub(): void {
    this.dataService.renewCategories$
      .asObservable()
      .pipe(takeUntil(this.updateDestroy$))
      .subscribe(() => {
        this.store.dispatch(MenuActions.getCategories());
        this.destroy$.next();
        this.subToForm();
      });
  }

  private subToForm(): void {
    this.storeCategories$.subscribe((categories) => {
      this.formCategories = this.fb.group(this.createFormCategory(categories));

      this.route.queryParamMap
        .pipe(takeUntil(this.destroy$))
        .subscribe((params) => {
          const paramsArr = params.getAll('category');

          if (!paramsArr.length) return;
          const paramsObject = paramsArr.reduce((acc, param) => {
            acc[param] = true;

            return acc;
          }, {} as { [key: string]: boolean });

          this.formCategories.patchValue(paramsObject);
        });

      this.formCategories.valueChanges
        .pipe(
          debounceTime(300),
          map((category) =>
            Object.entries(category)
              .filter((category) => category[1])
              .map((selectedCategory) => selectedCategory[0])
          ),
          takeUntil(this.destroy$)
        )
        .subscribe((data) => this.productFilters.emit(data));
    });
  }

  public ngOnInit(): void {
    this.isEdit = this.route.routeConfig?.path === 'menu/edit';
    this.subToForm();
    this.setUpdateSub();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.updateDestroy$.next();
    this.updateDestroy$.complete();
  }
}
