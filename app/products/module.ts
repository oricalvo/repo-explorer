import {NgModule}      from '@angular/core';
import {AppComponent}  from './components/main.component';
import {Routes, RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";

const routes: Routes = [
    { path: '',  component: AppComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        AppComponent,
    ],
})
export class ProductsModule {
}
