import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [RouterLink, MatIconModule],
  selector: 'app-portada',
  styleUrl: './portada.scss',
  templateUrl: './portada.html',
})
export class Portada {}
