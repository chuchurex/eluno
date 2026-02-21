# Query Sanity CMS

Ejecuta una consulta GROQ en Sanity y muestra los resultados.

## Argumentos
$ARGUMENTS = consulta GROQ o atajo predefinido

## Atajos disponibles
- "drafts" - Muestra todos los borradores
- "published" - Muestra documentos publicados
- "chapters" - Lista capítulos del libro
- "glossary" - Términos del glosario

## Instrucciones

1. Si $ARGUMENTS es un atajo, expándelo a la query GROQ correspondiente:
   - drafts: `*[_id match "drafts.*"]`
   - published: `*[!(_id match "drafts.*")]`
   - chapters: `*[_type == "chapter"]{title, number, _id}`
   - glossary: `*[_type == "glossaryTerm"]{term, definition}`

2. Si es una query personalizada, ejecútala directamente

3. Usa el MCP de Sanity para ejecutar la query

4. Formatea los resultados en tabla legible

5. Muestra conteo total de resultados

## Ejemplo de uso
`/sanity:query drafts` - Lista borradores
`/sanity:query *[_type == "author"]` - Query personalizada
