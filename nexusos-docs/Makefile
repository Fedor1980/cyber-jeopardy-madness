# NexusOS Documentation Platform - Makefile
# All targets are idempotent and safe to re-run

.PHONY: help setup lint diagrams html pdf slides index all validate package clean test doctor deploy

# Default target
.DEFAULT_GOAL := help

# Variables
DIST_DIR := dist
NODE := node
NPM := npm
PYTHON := python3
BASH := bash

help: ## Show this help message
	@echo "NexusOS Documentation Platform - Build System"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Install all dependencies (Node packages)
	@echo "→ Installing Node.js dependencies..."
	@$(NPM) install
	@echo "→ Verifying CLI tools..."
	@command -v mmdc >/dev/null 2>&1 || { echo "  WARNING: mmdc not found in PATH. Run: npm install -g @mermaid-js/mermaid-cli"; }
	@command -v markdownlint >/dev/null 2>&1 || { echo "  WARNING: markdownlint not found. It's in devDependencies."; }
	@echo "✓ Setup complete!"

doctor: ## Check system dependencies and environment
	@echo "→ Checking system dependencies..."
	@echo -n "  Node.js: " && node --version 2>/dev/null || echo "NOT FOUND"
	@echo -n "  npm: " && npm --version 2>/dev/null || echo "NOT FOUND"
	@echo -n "  Python: " && python3 --version 2>/dev/null || echo "NOT FOUND"
	@echo -n "  jq: " && jq --version 2>/dev/null || echo "NOT FOUND (optional)"
	@echo -n "  pandoc: " && pandoc --version 2>/dev/null | head -1 || echo "NOT FOUND (optional for PDF)"
	@echo -n "  mmdc: " && npx mmdc --version 2>/dev/null || echo "NOT FOUND (run npm install)"
	@echo "→ Checking repository structure..."
	@test -d docs && echo "  ✓ docs/ exists" || echo "  ✗ docs/ missing"
	@test -d build && echo "  ✓ build/ exists" || echo "  ✗ build/ missing"
	@test -d deployment && echo "  ✓ deployment/ exists" || echo "  ✗ deployment/ missing"
	@test -f package.json && echo "  ✓ package.json exists" || echo "  ✗ package.json missing"

lint: ## Run linters (markdownlint + cspell)
	@echo "→ Linting Markdown files..."
	@$(NPM) run lint
	@echo "✓ Lint complete!"

diagrams: ## Render Mermaid diagrams to SVG/PNG
	@echo "→ Rendering Mermaid diagrams..."
	@mkdir -p $(DIST_DIR)/diagrams
	@$(NODE) build/render_diagrams.mjs
	@echo "✓ Diagrams rendered!"

html: ## Generate HTML documentation
	@echo "→ Generating HTML documentation..."
	@mkdir -p $(DIST_DIR)/html
	@$(NODE) build/render_html.mjs
	@echo "✓ HTML generated!"

pdf: ## Generate PDF documentation
	@echo "→ Generating PDF documentation..."
	@mkdir -p $(DIST_DIR)/pdf
	@$(NODE) build/render_pdfs.mjs
	@echo "✓ PDFs generated!"

slides: ## Generate training slide deck (HTML/PDF)
	@echo "→ Generating training slides..."
	@mkdir -p $(DIST_DIR)/slides
	@$(NODE) build/render_slides.mjs
	@echo "✓ Slides generated!"

index: ## Build search index and manifest
	@echo "→ Building search index and manifest..."
	@mkdir -p $(DIST_DIR)/assets
	@$(NODE) build/search_indexer.mjs
	@$(NODE) build/toc_generator.mjs
	@echo "✓ Index and manifest complete!"

all: clean lint diagrams html pdf slides index ## Run complete build pipeline
	@echo ""
	@echo "═══════════════════════════════════════"
	@echo "✓ Full build complete!"
	@echo "═══════════════════════════════════════"
	@echo "Outputs in: $(DIST_DIR)/"
	@ls -lh $(DIST_DIR)/

validate: ## Validate all documentation (links, diagrams, schema)
	@echo "→ Validating documentation..."
	@$(BASH) deployment/deployment_scripts/scripts/validate_docs.sh
	@echo "✓ Validation complete!"

package: all ## Create distributable ZIP bundle
	@echo "→ Creating distribution package..."
	@cd $(DIST_DIR) && zip -r nexusos_docs_v1.0.zip . -x "*.DS_Store" "*.log"
	@echo "✓ Package created: $(DIST_DIR)/nexusos_docs_v1.0.zip"
	@ls -lh $(DIST_DIR)/nexusos_docs_v1.0.zip

clean: ## Remove all build artifacts
	@echo "→ Cleaning build artifacts..."
	@rm -rf $(DIST_DIR)/*
	@mkdir -p $(DIST_DIR)/{html,pdf,diagrams,assets,slides}
	@echo "✓ Clean complete!"

test: validate ## Run validation tests

# Advanced targets
audit: ## Run content quality audit
	@echo "→ Running content audit..."
	@$(PYTHON) build/audit_content.py
	@echo "✓ Audit complete!"

deploy-dry-run: ## Simulate deployment (dry-run mode)
	@echo "→ Running deployment dry-run..."
	@DRY_RUN=true $(BASH) deployment/deployment_scripts/deploy_all.sh
	@echo "✓ Dry-run complete!"

deploy: ## Deploy to configured platforms (requires secrets)
	@echo "→ Deploying documentation..."
	@$(BASH) deployment/deployment_scripts/deploy_all.sh
	@echo "✓ Deployment complete!"
