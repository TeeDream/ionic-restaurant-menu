import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { defer, forkJoin, from, map, Observable, of, retry, Subject, take, } from 'rxjs';
import { CategoryInterface, ProductInterface } from '@src/app/core/types';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  Query,
  query,
  QueryFieldFilterConstraint,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { DocumentData } from '@angular/fire/compat/firestore';
import { MenuFiltersInterface } from "@src/app/menu/types/menu-filters.interface";

@Injectable({
  providedIn: 'root',
})
export class DataService implements OnDestroy {
  private readonly BASE_URL = 'http://localhost:3000/';
  private readonly PRODUCTS = 'products';
  private readonly CATEGORIES = 'categories';
  private readonly NAME_FIELD = 'name';
  private readonly HOT_FIELD = 'hot';
  public renewProducts$ = new Subject<void>();
  public renewCategories$ = new Subject<void>();
  firestore: Firestore = inject(Firestore);

  constructor(private http: HttpClient) {}

  public getFilteredProducts({
                               filters,
                               queryString,
                             }: MenuFiltersInterface): Observable<ProductInterface[]> {
    if (!filters.length && !queryString) return of([]);

    const createQuery = ({
                           filters,
                           queryString,
                         }: MenuFiltersInterface): QueryFieldFilterConstraint[] => {
      const query: QueryFieldFilterConstraint[] = [];

      if (filters.length) query.push(where('categoryId', 'in', filters));
      if (queryString) {
        query.push(where(this.NAME_FIELD, '>=', queryString));
        query.push(where(this.NAME_FIELD, '<=', queryString + '\uf8ff'));
      }

      return query;
    };

    const productsQuery: Query<DocumentData> = query(
      collection(this.firestore, this.PRODUCTS),
      ...createQuery({ filters, queryString }),
      orderBy(this.NAME_FIELD)
    );
    const categoriesQuery: Query<DocumentData> = query(
      collection(this.firestore, this.CATEGORIES),
      orderBy(this.NAME_FIELD)
    );

    return this.forkJoinProductsAndCategories(productsQuery, categoriesQuery);
  }

  private forkJoinProductsAndCategories(
    productsQuery: Query<DocumentData>,
    categoriesQuery: Query<DocumentData>
  ): Observable<ProductInterface[]> {
    return forkJoin([
      collectionData(productsQuery, { idField: 'id' }).pipe(retry(2), take(1)),
      collectionData(categoriesQuery, {
        idField: 'id',
      }).pipe(retry(2), take(1)),
    ]).pipe(
      map((data): ProductInterface[] => {
        const [products, categories] = data;

        return products.map((product) => {
          return {
            ...product,
            category: categories.find((item) => {
              return item['id'] === product['categoryId'];
            }),
          } as ProductInterface;
        });
      })
    );
  }

  public getHotProducts(): Observable<ProductInterface[]> {
    const productsQuery: Query<DocumentData> = query(
      collection(this.firestore, this.PRODUCTS),
      where(this.HOT_FIELD, '==', true),
      orderBy(this.NAME_FIELD)
    );
    const categoriesQuery: Query<DocumentData> = query(
      collection(this.firestore, this.CATEGORIES),
      orderBy(this.NAME_FIELD)
    );

    return this.forkJoinProductsAndCategories(productsQuery, categoriesQuery);
  }

  public createProduct(
    product: Omit<ProductInterface, 'id' | 'category'>
  ): Observable<ProductInterface> {
    return defer(() =>
      from(setDoc(doc(collection(this.firestore, this.PRODUCTS)), product))
    ).pipe(
      retry(2),
      take(1),
      map(() => product as ProductInterface)
    );
  }

  public updateProduct(
    id: string,
    product: Partial<ProductInterface>
  ): Observable<ProductInterface> {
    return defer(() =>
      from(updateDoc(doc(this.firestore, this.PRODUCTS, id), product))
    ).pipe(
      retry(2),
      take(1),
      map(() => product as ProductInterface)
    );
  }

  public deleteProduct(id: string): Observable<void> {
    return defer(() =>
      from(deleteDoc(doc(this.firestore, this.PRODUCTS, id)))
    ).pipe(retry(2), take(1));
  }

  public getCategories(): Observable<CategoryInterface[]> {
    const categoriesQuery = query(
      collection(this.firestore, this.CATEGORIES),
      orderBy(this.NAME_FIELD)
    );

    return collectionData(categoriesQuery, { idField: 'id' }).pipe(
      take(1),
      map((data): CategoryInterface[] =>
        data.map((category) => category as CategoryInterface)
      )
    );
  }

  public createCategory({
                          name,
                        }: Omit<CategoryInterface, 'id'>): Observable<CategoryInterface> {
    return defer(() =>
      from(
        setDoc(doc(collection(this.firestore, this.CATEGORIES)), {
          name,
        })
      )
    ).pipe(
      retry(2),
      take(1),
      map(
        (): CategoryInterface => ({
          name,
          id: '',
        })
      )
    );
  }

  public updateCategory(
    id: string,
    category: Partial<CategoryInterface>
  ): Observable<CategoryInterface> {
    return defer(() =>
      from(updateDoc(doc(this.firestore, this.CATEGORIES, id), category))
    ).pipe(
      retry(2),
      take(1),
      map(() => category as CategoryInterface)
    );
  }

  public deleteCategory({ id }: CategoryInterface): Observable<void> {
    return defer(() =>
      from(deleteDoc(doc(this.firestore, this.CATEGORIES, id)))
    ).pipe(retry(2), take(1));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: Error): Observable<T> => {
      console.error(operation, error);

      return of(result as T);
    };
  }

  public ngOnDestroy(): void {
    this.renewProducts$.complete();
  }
}
