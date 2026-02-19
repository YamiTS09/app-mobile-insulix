import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-nosotros',
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class NosotrosComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
