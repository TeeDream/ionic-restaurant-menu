import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { CategoryInterface } from '@src/app/core/types';
import { DataService } from '@src/app/core/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { selectCategories } from '@src/app/menu/store/selectors';
import { Store } from '@ngrx/store';
import * as MenuActions from '@src/app/menu/store/actions';
import { CrudToastActionInterface } from '@src/app/menu/types/crud-toast-action.interface';
import { ProductActionResult } from '@src/app/menu/enums/product-action-result';
import { ProductActionType } from '@src/app/menu/enums/product-action-type';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
})
export class CategoryFilterComponent implements OnInit, OnDestroy {
  @Input() isAdmin!: boolean;
  @Output() menuCategoriesHandler: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();
  @Output() setCategoryToastOpen: EventEmitter<CrudToastActionInterface> =
    new EventEmitter<CrudToastActionInterface>();

  public storeCategories$: Observable<CategoryInterface[]> =
    this.store.select(selectCategories);
  public formCategories!: FormGroup;
  public isEditing = false;
  public isEdit = false;
  private destroy$ = new Subject<void>();
  private updateDestroy$ = new Subject<void>();
  public isAlertOpen = false;
  public currentCategoryToDelete: CategoryInterface | null = null;
  public isCreateCategoryModalOpen = false;
  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        if (!this.currentCategoryToDelete) return;
        this.deleteCategory(this.currentCategoryToDelete);
      },
    },
  ];

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {}

  private deleteCategory(category: CategoryInterface): void {
    this.dataService.deleteCategory(category).subscribe({
      next: () => {
        this.updateURLAfterDelete();

        this.dataService.renewCategories$.next();
        this.setCategoryToastOpen.emit({
          action: ProductActionType.DELETE,
          result: ProductActionResult.SUCCESS,
        });
        this.currentCategoryToDelete = null;
      },
      error: () => {
        this.setCategoryToastOpen.emit({
          action: ProductActionType.DELETE,
          result: ProductActionResult.FAILURE,
        });
      },
    });
  }

  private updateURLAfterDelete(): void {
    this.activatedRoute.queryParamMap
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((params) => {
        const filterParams = params.getAll('category');
        const shouldUpdateURL = !!filterParams.find(
          (category) => category === this.currentCategoryToDelete?.id
        );

        if (this.currentCategoryToDelete && shouldUpdateURL) {
          const query = params.get('query');
          const filtersAfterDelete = filterParams.filter(
            (category) => category !== this.currentCategoryToDelete?.id
          );

          this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: {
              category: filtersAfterDelete.length ? filtersAfterDelete : null,
              query: query?.length ? query : null,
            },
          });
        }
      });
  }

  public setCreateCategoryModal(isOpen: boolean): void {
    this.isCreateCategoryModalOpen = isOpen;
  }

  public setAlertOpen(isOpen: boolean, category?: CategoryInterface): void {
    if (category) this.currentCategoryToDelete = category;
    this.isAlertOpen = isOpen;
  }

  public clearCategories(): void {
    this.formCategories.reset();
  }

  public toggleEditing(): void {
    this.isEditing = !this.isEditing;
  }

  private createFormCategory(categories: CategoryInterface[]): {
    [key: string]: boolean;
  } {
    let paramsArray: string[] = [];

    this.activatedRoute.queryParamMap.pipe(take(1)).subscribe((params) => {
      paramsArray = params.getAll('category');
    });

    return categories.reduce(
      (acc, category) => {
        acc[category.id.toString()] = !!paramsArray.find(
          (param) => param === category.id
        );
        return acc;
      },
      {} as {
        [key: string]: boolean;
      }
    );
  }

  private setUpdateSub(): void {
    this.dataService.renewCategories$
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateDestroy$.next();
        this.store.dispatch(MenuActions.getCategories());
      });
  }

  private subToForm(): void {
    this.storeCategories$
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => {
        this.formCategories = this.fb.group(
          this.createFormCategory(categories)
        );

        this.formCategories.valueChanges
          .pipe(
            debounceTime(300),
            map((category) =>
              Object.entries(category)
                .filter((category) => category[1])
                .map((selectedCategory) => selectedCategory[0])
            ),
            takeUntil(this.updateDestroy$),
            takeUntil(this.destroy$)
          )
          .subscribe((data) => {
            this.menuCategoriesHandler.emit(data);
          });
      });
  }

  public ngOnInit(): void {
    this.isEdit = this.activatedRoute.routeConfig?.path === 'menu/edit';
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
