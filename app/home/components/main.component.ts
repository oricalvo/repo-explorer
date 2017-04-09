import {Component} from '@angular/core';
import {RepoService} from "../../services/repo.service";

@Component({
  selector: "my-home-main",
  moduleId: module.id,
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.css"]
})
export class MainComponent {
  constructor(private repoService: RepoService) {
  }

  get state() {
    return this.repoService.state;
  }

  ngOnInit() {
    this.repoService.loadAll();
  }
}
