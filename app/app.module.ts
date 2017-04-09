import {
    NgModule, NgModuleFactoryLoader, APP_INITIALIZER
}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent}  from './layout/app.component';
import {ClockComponent} from "./components/clock.component";
import {FormsModule} from "@angular/forms";
import { RouterModule, Routes } from '@angular/router';
import {ModuleLoader} from "./common/moduleLoader";
import {appRoutes} from "./routes";
import {MainComponent} from "./home/components/main.component";
import {RootService} from "./services/root.service";
import {ProductService} from "./services/product.service";
import {enableLogging} from "t-rex/logger";
enableLogging(true);
import {initAppStore} from "./appStore";
import {RepoService} from "./services/repo.service";
import {HttpModule} from "@angular/http";
import {RepoDetailsComponent} from "./home/components/repoDetails.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(appRoutes),
        HttpModule
    ],
    declarations: [
        AppComponent,
        ClockComponent,
        MainComponent,
        RepoDetailsComponent,
    ],
    bootstrap: [AppComponent],
    providers: [
        { provide: NgModuleFactoryLoader, useClass: ModuleLoader },
        RootService,
        ProductService,
        RepoService,
    ]
})
export class AppModule {
    constructor(rootService: RootService,
                productService: ProductService,
                repoService: RepoService) {
        initAppStore(
            rootService,
            productService,
            repoService
        );
    }
}
