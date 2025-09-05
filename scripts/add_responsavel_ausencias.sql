-- Script para adicionar campo responsável na tabela ausencias
-- Execute este script no banco de dados

-- Adicionar coluna responsavel na tabela ausencias
ALTER TABLE ausencias 
ADD COLUMN responsavel VARCHAR(255) NULL 
COMMENT 'Nome do responsável pela ausência';

-- Verificar se a coluna foi adicionada
DESCRIBE ausencias;
