# Execute este script APOS fechar: Prisma Studio, servidor Next.js, e Cursor/VS Code
# Pode executar no PowerShell: .\regenerate-prisma.ps1

Set-Location $PSScriptRoot
npx prisma generate
Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma Client regenerado com sucesso!" -ForegroundColor Green
    Write-Host "Agora voce pode abrir o projeto e rodar o servidor novamente." -ForegroundColor Green
} else {
    Write-Host "Erro. Feche TODOS os processos que usam o projeto e tente novamente." -ForegroundColor Red
}
