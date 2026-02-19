import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabCatalogoPageRoutingModule } from './tab-catalogo-routing.module';

import { TabCatalogoPage } from './tab-catalogo.page';
import { MedicoHeaderComponent } from 'src/app/components/medico-header/medico-header.component';
import { AddCatalogComponent } from '../../modals/add-catalog/add-catalog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabCatalogoPageRoutingModule,
    MedicoHeaderComponent
  ],
  declarations: [TabCatalogoPage, AddCatalogComponent]
})
export class TabCatalogoPageModule { }
