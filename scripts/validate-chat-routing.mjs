import { readFileSync } from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = process.cwd()
const projectsPath = path.join(root, "data", "projects.ts")
const routingPath = path.join(root, "knowledge", "projects.md")
const projectSource = readFileSync(projectsPath, "utf8")
const sourceFile = ts.createSourceFile(projectsPath, projectSource, ts.ScriptTarget.Latest, true)

const projectsDeclaration = sourceFile.statements
  .filter(ts.isVariableStatement)
  .flatMap((statement) => statement.declarationList.declarations)
  .find((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === "projects")

if (!projectsDeclaration || !projectsDeclaration.initializer || !ts.isArrayLiteralExpression(projectsDeclaration.initializer)) {
  throw new Error(`Could not read the projects catalogue from ${path.relative(root, projectsPath)}.`)
}

const projectSlugs = projectsDeclaration.initializer.elements.flatMap((element) => {
  if (!ts.isObjectLiteralExpression(element)) return []

  const slugProperty = element.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === "slug",
  )

  if (!slugProperty || !ts.isPropertyAssignment(slugProperty) || !ts.isStringLiteral(slugProperty.initializer)) {
    return []
  }

  return [slugProperty.initializer.text]
})

const routingSource = readFileSync(routingPath, "utf8")
const routedSlugs = new Set(
  routingSource.split("\n").flatMap((line) => {
    const cells = line.split("|").map((cell) => cell.trim())
    const slug = cells[2]?.match(/^`\/work\/([a-z0-9-]+)`$/)?.[1]
    return slug ? [slug] : []
  }),
)

const missingSlugs = projectSlugs.filter((slug) => !routedSlugs.has(slug))
if (missingSlugs.length > 0) {
  throw new Error(`Missing routing aliases in ${path.relative(root, routingPath)} for: ${missingSlugs.join(", ")}`)
}

console.log(`Chat routing: all ${projectSlugs.length} catalogue projects have routing rows.`)
