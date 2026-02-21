# Ver Schema de Sanity

Muestra el schema actual de Sanity para el proyecto.

## Argumentos
$ARGUMENTS = nombre del tipo (opcional)

## Instrucciones

1. Si no hay argumentos:
   - Lista todos los tipos de documento disponibles
   - Muestra conteo de documentos por tipo

2. Si hay un tipo específico:
   - Muestra la definición completa del tipo
   - Lista todos los campos con sus tipos
   - Muestra validaciones configuradas

3. Usa las herramientas MCP de Sanity:
   - `get_schema` para obtener el schema
   - `list_workspace_schemas` para ver workspaces

4. Formatea la salida de forma legible

## Ejemplo de uso
`/sanity:schema` - Lista todos los tipos
`/sanity:schema chapter` - Muestra schema del tipo "chapter"
