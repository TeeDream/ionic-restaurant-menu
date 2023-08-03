import { createReducer, on } from '@ngrx/store';
import * as MenuActions from './actions';
import { MenuStateInterface } from "@src/app/menu/types/menu-state-interface";

export const initialState: MenuStateInterface = {
  isLoadingCategories: false,
  isLoadingProducts: false,
  isLoadingHotProducts: false,
  categories: [],
  products: [],
  hotProducts: [],
  errorCategories: null,
  errorProducts: null,
  errorHotProducts: null,
};

export const reducers = createReducer(
  initialState,
  on(
    MenuActions.getCategories,
    (state): MenuStateInterface => ({ ...state, isLoadingCategories: true })
  ),
  on(
    MenuActions.getCategoriesFailure,
    (state, action): MenuStateInterface => ({
      ...state,
      isLoadingCategories: false,
      errorCategories: action.error,
    })
  ),
  on(
    MenuActions.getCategoriesSuccess,
    (state, action): MenuStateInterface => ({
      ...state,
      isLoadingCategories: false,
      categories: action.categories,
    })
  ),
  on(
    MenuActions.getProducts,
    (state): MenuStateInterface => ({
      ...state,
      isLoadingProducts: true,
    })
  ),
  on(
    MenuActions.getProductsFailure,
    (state, action): MenuStateInterface => ({
      ...state,
      isLoadingProducts: false,
      errorProducts: action.error,
    })
  ),
  on(
    MenuActions.getProductsSuccess,
    (state, action): MenuStateInterface => ({
      ...state,
      isLoadingProducts: false,
      products: action.products,
    })
  ),
  on(
    MenuActions.getHotProducts,
    (state): MenuStateInterface => ({
      ...state,
      isLoadingHotProducts: true,
    })
  ),
  on(
    MenuActions.getHotProductsSuccess,
    (state, action): MenuStateInterface => ({
      ...state,
      isLoadingHotProducts: false,
      hotProducts: action.hotProducts,
    })
  ),
  on(
    MenuActions.getHotProductsFailure,
    (state, action): MenuStateInterface => ({
      ...state,
      isLoadingHotProducts: false,
      errorHotProducts: action.error,
    })
  )
);
