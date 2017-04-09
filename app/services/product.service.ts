import {ServiceStore, Activity} from "t-rex";

export interface Product {
    id: number;
    name: string;
}

export interface ProductsState {
    products: Product[];
}

export class ProductService {
    store = ServiceStore.create<ProductsState>("products", {
        products: null,
    });

    get state() {
        return this.store.getState();
    }

    @Activity()
    loadAll() {
        this.store.update({
            products: [
                {id: 1, name: "Banana"},
                {id: 2, name: "Apple"},
            ]
        });
    }
}
