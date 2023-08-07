import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DocumentData } from '@angular/fire/compat/firestore';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { CategoryInterface, ProductInterface } from '@src/app/core/types';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import {
  selectCategories,
  selectHotProducts,
  selectProducts,
} from '@src/app/menu/store/selectors';
import { DataService } from '@src/app/core/services/data.service';
import { AuthService } from '@src/app/auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuFiltersInterface } from '@src/app/menu/types/menu-filters.interface';
import * as MenuActions from '@src/app/menu/store/actions';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.scss'],
})
export class MenuPageComponent implements OnInit, OnDestroy {
  public isAuth$!: Observable<boolean>;
  public isAdmin!: boolean;
  public isEditing = false;
  private destroy$ = new Subject<void>();
  public isFiltersEmpty$!: Observable<boolean>;

  private item$!: Observable<DocumentData[]>;
  private firestore: Firestore = inject(Firestore);
  public storeCategories$: Observable<CategoryInterface[]> =
    this.store.select(selectCategories);
  public storeProducts$: Observable<ProductInterface[]> =
    this.store.select(selectProducts);
  public storeHotProducts$: Observable<ProductInterface[]> =
    this.store.select(selectHotProducts);
  public menuFilters: MenuFiltersInterface = {
    filters: [],
    queryString: '',
  };

  isModalOpen = false;

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  constructor(
    private dataService: DataService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {
    const itemCollection = collection(this.firestore, 'categories');
    this.item$ = collectionData(itemCollection);
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

    // this.isAuth$ = this.auth.getLogInStatus$();
    this.isAuth$ = this.auth.getLogInStatus$();
    this.isAdmin = this.auth.isAdmin;
    this.isEditing = this.route.routeConfig?.path === 'menu/edit';
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
