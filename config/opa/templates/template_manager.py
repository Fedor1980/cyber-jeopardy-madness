#!/usr/bin/env python3
"""
Compliance Template Manager
Manages installation and activation of compliance policy templates.
"""
import os
import shutil
import requests
from pathlib import Path

# Template definitions
TEMPLATES = {
    "gdpr": {
        "name": "GDPR Article 6 - Lawful Basis",
        "file": "gdpr_article6.rego",
        "description": "Implements GDPR Article 6(1) consent verification with lawful basis checks",
        "regulations": ["GDPR"],
        "package": "scrolls.consent.gdpr"
    },
    "hipaa": {
        "name": "HIPAA PHI Access Control",
        "file": "hipaa_phi.rego",
        "description": "Implements HIPAA Privacy Rule requirements for PHI access",
        "regulations": ["HIPAA"],
        "package": "scrolls.consent.hipaa"
    },
    "ccpa": {
        "name": "CCPA Opt-Out Rights",
        "file": "ccpa_optout.rego",
        "description": "Implements CCPA Do Not Sell and purpose limitation",
        "regulations": ["CCPA"],
        "package": "scrolls.consent.ccpa"
    }
}

def list_templates():
    """List all available compliance templates."""
    print("\nAvailable Compliance Templates:")
    print("=" * 80)
    for key, template in TEMPLATES.items():
        print(f"\n[{key}] {template['name']}")
        print(f"    Regulations: {', '.join(template['regulations'])}")
        print(f"    Description: {template['description']}")
        print(f"    Package: {template['package']}")
    print("=" * 80)

def install_template(template_key):
    """
    Install a compliance template by copying it to the active policies directory.
    """
    if template_key not in TEMPLATES:
        print(f"Error: Template '{template_key}' not found")
        return False

    template = TEMPLATES[template_key]
    template_dir = Path(__file__).parent
    active_dir = template_dir.parent

    source = template_dir / template['file']
    dest = active_dir / template['file']

    if not source.exists():
        print(f"Error: Template file '{source}' not found")
        return False

    # Copy template to active directory
    shutil.copy(source, dest)
    print(f"✅ Installed {template['name']}")
    print(f"   File: {dest}")
    print(f"   Package: {template['package']}")

    return True

def activate_template(template_key, opa_url="http://localhost:8181"):
    """
    Activate a template by hot-reloading OPA.
    """
    if not install_template(template_key):
        return False

    # Trigger OPA reload (if OPA supports it)
    try:
        response = requests.post(f"{opa_url}/v1/policies", timeout=5)
        print(f"✅ OPA policies reloaded")
        return True
    except Exception as e:
        print(f"⚠️  Could not reload OPA: {e}")
        print("   Please restart OPA container to activate")
        return False

def generate_test_data(template_key):
    """
    Generate test consent data for a template.
    """
    if template_key == "gdpr":
        return {
            "consents": [
                {
                    "consent_id": "0xGDPR_TEST_001",
                    "status": "CONSENTED",
                    "lawful_basis": "consent",
                    "timestamp": "2024-01-15T10:00:00Z",
                    "expiration_date": "2025-01-15T10:00:00Z"
                }
            ]
        }
    elif template_key == "hipaa":
        return {
            "consents": [
                {
                    "consent_id": "0xHIPAA_TEST_001",
                    "status": "CONSENTED",
                    "authorization_type": "HIPAA",
                    "patient_signature": true,
                    "authorized_uses": ["treatment", "payment", "healthcare_operations"],
                    "expiration_date": "2025-01-15T10:00:00Z"
                }
            ]
        }
    elif template_key": "ccpa":
        return {
            "consents": [
                {
                    "consent_id": "0xCCPA_TEST_001",
                    "ccpa_opt_out_sale": false,
                    "ccpa_opt_out_sharing": false,
                    "limit_sensitive_pi_use": false,
                    "disclosed_categories": ["identifiers", "commercial_info"],
                    "disclosed_purposes": ["business_operations"]
                }
            ]
        }

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python template_manager.py [list|install|activate] [template_key]")
        list_templates()
        sys.exit(1)

    command = sys.argv[1]

    if command == "list":
        list_templates()
    elif command == "install" and len(sys.argv) >= 3:
        install_template(sys.argv[2])
    elif command == "activate" and len(sys.argv) >= 3:
        activate_template(sys.argv[2])
    else:
        print("Invalid command")
        print("Usage: python template_manager.py [list|install|activate] [template_key]")
