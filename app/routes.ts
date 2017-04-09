import {Routes} from "@angular/router";
import {MainComponent} from "./home/components/main.component";
import {RepoDetailsComponent} from "./home/components/repoDetails.component";

const home = "home";

export const appRoutes: Routes = [
    {
        path: 'home',
        component: MainComponent
    },
    {
        path: 'repo/:name',
        component: RepoDetailsComponent
    },
    {
        path: 'admin',
        loadChildren: "/app/admin/module#AdminModule",
    },
    {
        path: 'about',
        loadChildren: "/app/about/module#AboutModule",
    },
    {
        path: 'products',
        loadChildren: "/app/products/module#ProductsModule",
    },
];

