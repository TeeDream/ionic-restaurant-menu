import { NgModule } from '@angular/core';

import { MenuRoutingModule } from './menu-routing.module';
import { InputRestrictionDirective } from './directives/input-restriction.directive';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from '@src/app/menu/store/reducers';
import { MenuEffects } from '@src/app/menu/store/effects';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MenuPageComponent } from '@src/app/menu/pages/menu-page/menu-page.component';
import { CategoryFilterComponent } from '@src/app/menu/components/category-filter/category-filter.component';
import { ProductItemComponent } from '@src/app/menu/components/product-item/product-item.component';
import { ProductSearchComponent } from '@src/app/menu/components/product-search/product-search.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { ProductEditModalComponent } from '@src/app/menu/components/product-edit-modal/product-edit-modal.component';
import { ProductCreateModalComponent } from '@src/app/menu/components/product-create-modal/product-create-modal.component';
import { CategoryCreateModalComponent } from '@src/app/menu/components/category-create-modal/category-create-modal.component';

@NgModule({
  declarations: [
    InputRestrictionDirective,
    MenuPageComponent,
    CategoryFilterComponent,
    ProductItemComponent,
    ProductSearchComponent,
    ProductEditModalComponent,
    ProductCreateModalComponent,
    CategoryCreateModalComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    MenuRoutingModule,
    StoreModule.forFeature('menu', reducers),
    EffectsModule.forFeature([MenuEffects]),
    SharedModule,
  ],
  providers: [TitleCasePipe],
})
export class MenuModule {}
