import { Component } from '@angular/core';
import {ProductService} from "../../services/product.service";

@Component({
  selector: "my-admin-app",
  moduleId: module.id,
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.css"]
})
export class AppComponent {
  constructor(private productService: ProductService) {
  }

  get state() {
    return this.productService.state;
  }
}
