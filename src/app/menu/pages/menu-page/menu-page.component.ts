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
import { ProductType } from '@src/app/menu/enums/product.type';
import { TitleCasePipe } from '@angular/common';
import { CrudToastActionInterface } from '@src/app/menu/types/crud-toast-action.interface';
import { ProductActionResult } from '@src/app/menu/enums/product-action-result';
import { ProductActionType } from '@src/app/menu/enums/product-action-type';

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
  public isFilterModalOpen = false;
  public isProductModalOpen = false;
  public isCreateProductModalOpen = false;
  public isCRUDToastOpen = false;
  public crudToastText = '';
  public isRemoveActionOpen = false;
  public removeActionSubHeader = '';
  public lastProductToDelete: string | null = null;
  protected readonly ProductType = ProductType;
  private destroy$: Subject<void> = new Subject<void>();
  public notify$: Subject<ProductInterface> = new Subject<ProductInterface>();

  constructor(
    private dataService: DataService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store,
    private titleCasePipe: TitleCasePipe
  ) {}

  public deleteProduct(): void {
    if (!this.lastProductToDelete) return;

    this.dataService.deleteProduct(this.lastProductToDelete).subscribe({
      next: () => {
        this.dataService.renewProducts$.next();
        this.setCRUDToastOpen(true, ProductType.DISH, {
          action: ProductActionType.DELETE,
          result: ProductActionResult.SUCCESS,
        });
      },
      error: () => {
        this.setCRUDToastOpen(true, ProductType.DISH, {
          action: ProductActionType.DELETE,
          result: ProductActionResult.FAILURE,
        });
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

  private createToastText(
    productType: ProductType,
    actionResult: CrudToastActionInterface
  ): string {
    const actionInSimpleForm = this.titleCasePipe.transform(
      actionResult.action
    );
    const productTypeTitleCase = this.titleCasePipe.transform(productType);

    return `${
      actionResult.result === ProductActionResult.SUCCESS
        ? 'Successfully'
        : actionResult.result === ProductActionResult.FAILURE
        ? 'Failed to'
        : 'Unknown Result'
    } ${
      actionResult.action === ProductActionType.MODIFY
        ? `${
            actionResult.result === ProductActionResult.SUCCESS
              ? 'Modified'
              : actionInSimpleForm
          }`
        : actionResult.action === ProductActionType.DELETE
        ? `${
            actionResult.result === ProductActionResult.SUCCESS
              ? 'Deleted'
              : actionInSimpleForm
          }`
        : actionResult.action === ProductActionType.CREATE
        ? `${
            actionResult.result === ProductActionResult.SUCCESS
              ? 'Created'
              : actionInSimpleForm
          }`
        : 'fired an Unknown Action'
    } the ${
      productType === ProductType.DISH
        ? productTypeTitleCase
        : productType === ProductType.CATEGORY
        ? productTypeTitleCase
        : 'Unknown Type'
    }!`;
  }

  public setCRUDToastOpen(state: boolean): void;
  public setCRUDToastOpen(
    state: boolean,
    productType: ProductType,
    actionResult: CrudToastActionInterface
  ): void;
  public setCRUDToastOpen(
    state: boolean,
    productType?: ProductType,
    actionResult?: CrudToastActionInterface
  ): void {
    if (state && this.isCRUDToastOpen) this.isCRUDToastOpen = false;
    if (productType && actionResult?.action && actionResult.result) {
      this.crudToastText = this.createToastText(productType, actionResult);
    }

    this.isCRUDToastOpen = state;
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
      relativeTo: this.activatedRoute,
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
    this.activatedRoute.queryParamMap
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

    this.isFiltersEmpty$ = this.activatedRoute.queryParamMap.pipe(
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
    this.isEditing = this.activatedRoute.routeConfig?.path === 'menu/edit';
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
