import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MenuStateInterface } from '@src/app/menu/types/menu-state-interface';

export const featureKey = 'menu';
export const selectFeature =
  createFeatureSelector<MenuStateInterface>(featureKey);

// export const selectFeature = (state: AppStateInterface) => state.menu;
export const selectIsLoadingCategories = createSelector(
  selectFeature,
  (state) => state.isLoadingCategories
);

export const selectIsLoadingProducts = createSelector(
  selectFeature,
  (state) => state.isLoadingProducts
);

export const selectCategories = createSelector(
  selectFeature,
  (state) => state.categories
);
export const selectCategoriesError = createSelector(
  selectFeature,
  (state) => state.errorCategories
);

export const selectProducts = createSelector(
  selectFeature,
  (state) => state.products
);

export const selectHotProducts = createSelector(
  selectFeature,
  (state) => state.hotProducts
);
