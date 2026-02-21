# Gestionar TODOs del Proyecto

Muestra o actualiza la lista de tareas pendientes del proyecto.

## Argumentos
$ARGUMENTS puede ser:
- (vacío): Muestra todas las tareas
- "add [tarea]": Agrega una nueva tarea
- "done [número]": Marca tarea como completada

## Instrucciones

1. Lee el archivo `docs/project/TODO.md` del repositorio
2. Si no hay argumentos, muestra lista categorizada:
   - Por prioridad (alta, media, baja)
   - Por área (audiobook, web, content, infra)

3. Si es "add", agrega la tarea al archivo TODO.md en la categoría apropiada

4. Si es "done", marca la tarea como completada con fecha

5. Muestra resumen:
   ```
   Pendientes: 15 | En progreso: 3 | Completadas: 42
   ```

## Ejemplo de uso
`/project:todo` - Lista todas las tareas
`/project:todo add Probar voz EN en Fish Audio` - Agrega tarea
`/project:todo done 5` - Marca tarea #5 como completada
