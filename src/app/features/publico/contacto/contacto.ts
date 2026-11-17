import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatIconModule],
  selector: 'app-contacto',
  styleUrl: './contacto.scss',
  templateUrl: './contacto.html',
})
export class Contacto {
  protected readonly equipo = [
    { nombre: 'Mayluz Ballestas', carrera: 'Ingeniería en Computación', foto: 'mb.png', correo: 'mayluzaballetas058@ujgh.edu.ve' },
    { nombre: 'Lina Gónzalez', carrera: 'Ingeniería en Sistemas', foto: 'lg1.png', correo: 'linagonzalez298@ujgh.edu.ve' },
    { nombre: 'Benigno Guerrero', carrera: 'Ingeniería en Computación', foto: 'bg.png', correo: 'benignoguerrero496@ujgh.edu.ve' },
    { nombre: 'Leidys Suárez', carrera: 'Ingeniería en Computación', foto: 'ls.png', correo: 'leidyssuarez259@ujgh.edu.ve' },
  ];
}
