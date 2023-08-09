import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoryInterface, ProductInterface } from '@src/app/core/types';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import {
  selectCategories,
  selectHotProducts,
  selectIsLoadingProducts,
  selectProducts,
} from '@src/app/menu/store/selectors';
import { DataService } from '@src/app/core/services/data.service';
import { AuthService } from '@src/app/auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuFiltersInterface } from '@src/app/menu/types/menu-filters.interface';
import * as MenuActions from '@src/app/menu/store/actions';
import { ProductActionState } from '@src/app/menu/enums/product-action.state';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.scss'],
})
export class MenuPageComponent implements OnInit, OnDestroy {
  public isAuth$!: Observable<boolean>;
  public isAdmin!: boolean;
  public isEditing = false;
  public isFiltersEmpty$!: Observable<boolean>;
  public menuFilters: MenuFiltersInterface = {
    filters: [],
    queryString: '',
  };
  public storeCategories$: Observable<CategoryInterface[]> =
    this.store.select(selectCategories);
  public storeProducts$: Observable<ProductInterface[]> =
    this.store.select(selectProducts);
  public storeHotProducts$: Observable<ProductInterface[]> =
    this.store.select(selectHotProducts);
  public storeProductsIsLoading$: Observable<boolean> = this.store.select(
    selectIsLoadingProducts
  );
  private destroy$ = new Subject<void>();
  public isFilterModalOpen = false;
  public isProductModalOpen = false;
  public isCreateProductModalOpen = false;
  public notify$: Subject<ProductInterface> = new Subject<ProductInterface>();
  public isProductToastOpen = false;
  public productToastText = '';
  public isRemoveActionOpen = false;

  public removeActionSubHeader = '';
  public lastProductToDelete: string | null = null;

  constructor(
    private dataService: DataService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {}

  public deleteProduct(): void {
    if (!this.lastProductToDelete) return;

    this.dataService.deleteProduct(this.lastProductToDelete).subscribe({
      next: () => {
        this.dataService.renewProducts$.next();
        this.setProductToastOpen(true, ProductActionState.DELETE_SUCCESS);
      },
      error: () => {
        this.setProductToastOpen(true, ProductActionState.DELETE_FAILURE);
      },
    });
  }

  public setRemoveAction(isOpen: boolean, product?: ProductInterface): void {
    if (product) {
      this.removeActionSubHeader = product.name;
      this.lastProductToDelete = product.id;
    }

    this.isRemoveActionOpen = isOpen;
  }

  public setProductToastOpen(state: boolean, toast?: ProductActionState): void {
    if (
      toast === ProductActionState.MODIFY_SUCCESS ||
      toast === ProductActionState.DELETE_SUCCESS ||
      toast === ProductActionState.CREATE_SUCCESS
    ) {
      this.productToastText = `Successfully ${
        toast === ProductActionState.MODIFY_SUCCESS
          ? 'Modified'
          : toast === ProductActionState.DELETE_SUCCESS
          ? 'Deleted'
          : 'Created'
      } the Product!`;
    }

    if (
      toast === ProductActionState.MODIFY_FAILURE ||
      toast === ProductActionState.DELETE_FAILURE ||
      toast === ProductActionState.CREATE_FAILURE
    ) {
      this.productToastText = `Failed to ${
        toast === ProductActionState.MODIFY_FAILURE
          ? 'Modify'
          : toast === ProductActionState.DELETE_FAILURE
          ? 'Delete'
          : 'Create'
      } the Product!`;
    }

    this.isProductToastOpen = state;
  }

  public setOpen(isOpen: boolean): void {
    this.isFilterModalOpen = isOpen;
  }

  public setModifyProductOpen(
    isOpen: boolean,
    product?: ProductInterface
  ): void {
    if (product) this.notify$.next(product);
    this.isProductModalOpen = isOpen;
  }

  public setCreateProductOpen(isOpen: boolean): void {
    this.isCreateProductModalOpen = isOpen;
  }

  public isAnyProductsWithinCategory(
    category: CategoryInterface,
    products: ProductInterface[]
  ): boolean {
    return products.some((item) => item.categoryId === category.id);
  }

  public menuCategoriesHandler(arr: string[]): void {
    this.menuFilters.filters = arr;
    this.changeQueryRoute();
  }

  public menuQueryHandler(query: string): void {
    this.menuFilters.queryString = query;
    this.changeQueryRoute();
  }

  private changeQueryRoute(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.menuFilters.filters.length
          ? this.menuFilters.filters
          : null,
        query: this.menuFilters.queryString
          ? this.menuFilters.queryString
          : null,
      },
    });
  }

  private setUpdateProductsSub(): void {
    this.dataService.renewProducts$
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.dispatch(MenuActions.getProducts(this.menuFilters));
      });
  }

  private setUpdateCategoriesSub(): void {
    this.dataService.renewCategories$
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.dispatch(MenuActions.getCategories());
        this.store.dispatch(MenuActions.getProducts(this.menuFilters));
      });
  }

  private setRouteChangeSub(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((data): void => {
        if (data.has('category') && !this.menuFilters.filters.length) {
          this.menuFilters.filters = data.getAll('category');
        }

        if (data.has('query') && !this.menuFilters.queryString) {
          this.menuFilters.queryString = data.get('query') as string;
        }
        this.store.dispatch(MenuActions.getProducts(this.menuFilters));
      });

    this.isFiltersEmpty$ = this.route.queryParamMap.pipe(
      map((data) => !data.keys.length)
    );
  }

  public ngOnInit(): void {
    this.store.dispatch(MenuActions.getHotProducts());
    this.store.dispatch(MenuActions.getCategories());
    this.setRouteChangeSub();
    this.setUpdateProductsSub();
    this.setUpdateCategoriesSub();
    this.isAuth$ = this.auth.getLogInStatus$();
    this.isAdmin = this.auth.isAdmin;
    this.isEditing = this.route.routeConfig?.path === 'menu/edit';
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
