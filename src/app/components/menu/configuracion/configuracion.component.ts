import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonBackButton } from '@ionic/angular';
@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ConfiguracionComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
