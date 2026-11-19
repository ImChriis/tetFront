import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuariosApi } from '../../../core/services/usuarios';
import { Auth } from '../../../core/services/auth';
import { Usuario } from '../../../core/models/usuario';
import { mensajeError } from '../../../core/api';
import { CrearUsuario } from './components/crear-usuario/crear-usuario';
import { Confirmar, DatosConfirmar } from '../components/confirmar/confirmar';

@Component({
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  selector: 'app-usuarios',
  styleUrl: './usuarios.scss',
  templateUrl: './usuarios.html',
})
export class Usuarios {
  private readonly api = inject(UsuariosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  protected readonly yo = inject(Auth).usuario;

  protected readonly columnas = ['nombre', 'usuario', 'correo', 'rol', 'acciones'];
  protected readonly usuarios = rxResource({ stream: () => this.api.listar(), defaultValue: [] });

  abrir(usuario?: Usuario) {
    this.dialog
      .open(CrearUsuario, { data: usuario ?? null, width: '640px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) {
          this.snack.open(usuario ? 'Usuario actualizado' : 'Usuario creado', 'OK', { duration: 3000 });
          this.usuarios.reload();
        }
      });
  }

  eliminar(usuario: Usuario) {
    this.dialog
      .open<Confirmar, DatosConfirmar, boolean>(Confirmar, {
        data: { titulo: 'Eliminar usuario', mensaje: `${usuario.nombre} ${usuario.apellido} ya no podrá entrar al panel.`, accion: 'Eliminar' },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.api.eliminar(usuario.id).subscribe({
          next: () => {
            this.snack.open('Usuario eliminado', 'OK', { duration: 3000 });
            this.usuarios.reload();
          },
          error: (e) => this.snack.open(mensajeError(e), 'Cerrar', { duration: 5000 }),
        });
      });
  }
}
