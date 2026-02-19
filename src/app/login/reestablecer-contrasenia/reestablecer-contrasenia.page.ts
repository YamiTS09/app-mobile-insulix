import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reestablecer-contrasenia',
  templateUrl: './reestablecer-contrasenia.page.html',
  styleUrls: ['./reestablecer-contrasenia.page.scss'],
  standalone: false,
})
export class ReestablecerContraseniaPage implements OnInit {

 
   step: number = 1;

  siguiente() {
    this.step++;
  }

  anterior() {
    this.step--;
  }
  
  constructor() { }

  ngOnInit() {
  }

}
